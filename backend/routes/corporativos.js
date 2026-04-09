const express = require('express');
const router = express.Router();
const Corporativo = require('../models/Corporativo');
const crypto = require('crypto');

// 1. REGISTRO CORPORATIVO
router.post('/registro', async (req, res) => {
    try {
        console.log("🏢 [BACKEND] Intento de registro corporativo recibido:", req.body);
        
        const qrToken = crypto.randomBytes(16).toString('hex');
        const nuevoCorp = new Corporativo({ 
            ...req.body, 
            qrToken: qrToken 
        });

        console.log("💾 [BACKEND] Intentando guardar en la colección 'corporativos'...");
        const guardado = await nuevoCorp.save();
        
        console.log("✅ [BACKEND] Empresa guardada con éxito:", guardado.nombre);
        res.status(201).json(guardado);
    } catch (error) {
        console.error("❌ [BACKEND] Error al registrar corporativo:", error);
        if (error.code === 11000) {
            return res.status(409).json({ error: "El correo ya está registrado en el portal corporativo." });
        }
        res.status(500).json({ error: error.message });
    }
});

// 2. LOGIN CORPORATIVO
router.post('/login', async (req, res) => {
    try {
        const { correo, password } = req.body;
        const corp = await Corporativo.findOne({ correo, password });
        if (corp) {
            res.status(200).json(corp);
        } else {
            res.status(401).json({ error: "Credenciales de empresa inválidas" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. OBTENER DATOS DE EMPRESA
router.get('/:correo', async (req, res) => {
    try {
        const corp = await Corporativo.findOne({ correo: req.params.correo });
        if (corp) res.status(200).json(corp);
        else res.status(404).json({ error: "Empresa no encontrada" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. PUBLICAR OFERTA
router.post('/ofertas/publicar', async (req, res) => {
    try {
        const { correo } = req.query;
        const { titulo, descripcion, descuento, imagenUrl, fechaFin } = req.body;
        const actualizado = await Corporativo.findOneAndUpdate(
            { correo },
            { $push: { ofertas: { titulo, descripcion, descuento, imagenUrl, fechaFin } } },
            { new: true }
        );
        res.status(200).json(actualizado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
