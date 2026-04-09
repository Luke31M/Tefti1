const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Negocio = require('../models/Negocio');

// Registrar usuario
router.post('/registro', async (req, res) => {
    try {
        const nuevoUsuario = new User(req.body);
        const usuarioGuardado = await nuevoUsuario.save();
        res.status(201).json(usuarioGuardado);
    } catch (error) {
        // Enviar error claro si el usuario ya existe (código 11000 es duplicate key en MongoDB)
        if (error.code === 11000) {
            return res.status(409).json({ error: "El correo ya está registrado" });
        }
        res.status(500).json(error);
    }
});

// Login de usuario
router.post('/login', async (req, res) => {
    try {
        const { correo, password } = req.body;
        const usuario = await User.findOne({ correo, password });
        
        if (usuario) {
            res.status(200).json(usuario);
        } else {
            res.status(401).json({ error: "Credenciales inválidas" });
        }
    } catch (error) {
        res.status(500).json(error);
    }
});


// Obtener datos de usuario (incluye puntos y sellos para el TEFTI PASS)
router.get('/:correo', async (req, res) => {
    try {
        const usuario = await User.findOne({ correo: req.params.correo });
        if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.status(200).json(usuario);
    } catch (error) {
        res.status(500).json(error);
    }
});

// Actualizar nombre u otros datos de usuario
router.put('/:correo', async (req, res) => {
    try {
        const usuarioActualizado = await User.findOneAndUpdate(
            { correo: req.params.correo },
            req.body,
            { new: true }
        );
        res.status(200).json(usuarioActualizado);
    } catch (error) {
        res.status(500).json(error);
    }
});

// TEFTI PASS: Escanear QR de un negocio y ganar puntos
router.post('/:correo/escanear', async (req, res) => {
    try {
        const { qrToken } = req.body;
        if (!qrToken) return res.status(400).json({ error: 'Token QR requerido' });

        // 1. Validar que el negocio con ese token exista
        const negocio = await Negocio.findOne({ qrToken });
        if (!negocio) return res.status(404).json({ error: 'QR no válido o negocio no encontrado' });

        // 2. Obtener al usuario
        const usuario = await User.findOne({ correo: req.params.correo });
        if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

        // 3. Anti-spam: verificar si ya escaneó este negocio en las últimas 24 horas
        const hace24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const escaneadoReciente = usuario.sellos.some(
            s => s.negocioCorreo === negocio.correo && new Date(s.fecha) > hace24h
        );
        if (escaneadoReciente) {
            return res.status(429).json({
                error: 'Ya ganaste puntos en este local hoy. ¡Vuelve mañana!',
                puntos: usuario.puntos,
                sellos: usuario.sellos.length
            });
        }

        // 4. Sumar 10 puntos y agregar sello
        const PUNTOS_POR_SELLO = 10;
        const usuarioActualizado = await User.findOneAndUpdate(
            { correo: req.params.correo },
            {
                $inc: { puntos: PUNTOS_POR_SELLO },
                $push: {
                    sellos: {
                        negocioCorreo: negocio.correo,
                        negocioNombre: negocio.nombre,
                        puntosGanados: PUNTOS_POR_SELLO,
                        fecha: new Date()
                    }
                }
            },
            { new: true }
        );

        // 5. Incrementar contador en el Negocio
        await Negocio.findOneAndUpdate({ qrToken }, { $inc: { sellosEmitidos: 1 } });

        res.status(200).json({
            mensaje: `¡+${PUNTOS_POR_SELLO} puntos ganados en ${negocio.nombre}!`,
            negocioNombre: negocio.nombre,
            puntos: usuarioActualizado.puntos,
            totalSellos: usuarioActualizado.sellos.length,
            sellos: usuarioActualizado.sellos
        });
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
});

module.exports = router;
