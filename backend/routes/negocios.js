const express = require('express');
const router = express.Router();
const Negocio = require('../models/Negocio');
const crypto = require('crypto');

console.log('✅ Router de Negocios cargado (Versión QueryParam)');

// Helper para corregir URLs antiguas con IP fija a URLs dinámicas
function normalizarUrls(negocio, req) {
    if (!negocio) return negocio;
    const currentHost = `${req.protocol}://${req.get('host')}`;
    const oldIP = "http://172.20.28.35:3000";

    const fix = (url) => {
        if (url && url.includes(oldIP)) {
            return url.replace(oldIP, currentHost);
        }
        if (url && url.startsWith('/uploads')) {
            return currentHost + url;
        }
        return url;
    };

    const n = negocio.toObject ? negocio.toObject() : negocio;
    n.imagenUrl = fix(n.imagenUrl);
    if (n.productos) {
        n.productos = n.productos.map(p => ({ ...p, imagenUrl: fix(p.imagenUrl) }));
    }
    if (n.ofertas) {
        n.ofertas = n.ofertas.map(o => ({ ...o, imagenUrl: fix(o.imagenUrl) }));
    }
    return n;
}

// 1. REGISTRO Y LOGIN
router.post('/nuevo', async (req, res) => {
    try {
        console.log("📥 Recibiendo registro de negocio:", req.body.correo);
        
        // Generar QR Token único
        const qrToken = crypto.randomBytes(16).toString('hex');
        
        // Crear instancia del modelo
        const nuevoNegocio = new Negocio({
            ...req.body,
            qrToken: qrToken
        });

        // Guardar en la DB
        const negocioGuardado = await nuevoNegocio.save();
        console.log("✅ Negocio guardado con éxito:", negocioGuardado.nombre);
        
        res.status(201).json(negocioGuardado);

    } catch (error) {
        console.error("❌ ERROR EN REGISTRO:", error);

        // Caso: Correo o Token duplicado
        if (error.code === 11000) {
            return res.status(409).json({ 
                error: "Dato duplicado detectado.", 
                details: "El correo electrónico ya está registrado en nuestra base de datos. Por favor usa uno diferente." 
            });
        }

        // Caso: Faltan datos requeridos (Mongoose Validation)
        if (error.name === 'ValidationError') {
            const campos = Object.keys(error.errors).join(', ');
            return res.status(400).json({ 
                error: "Datos incompletos.", 
                details: `Faltan o son inválidos los siguientes campos: ${campos}` 
            });
        }

        // Caso General
        res.status(500).json({ 
            error: "Error interno del servidor.", 
            details: error.message 
        });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { correo, password } = req.body;
        const negocio = await Negocio.findOne({ correo, password });
        if (negocio) {
            res.status(200).json({ _id: negocio._id, nombre: negocio.nombre, correo: negocio.correo });
        } else {
            res.status(401).json({ error: "Credenciales inválidas" });
        }
    } catch (error) {
        res.status(500).json(error);
    }
});

// 2. DIAGNÓSTICO Y LISTADO GLOBAL
router.get('/todos', async (req, res) => {
    try {
        const negocios = await Negocio.find();
        res.status(200).json(negocios.map(n => normalizarUrls(n, req)));
    } catch (error) {
        res.status(500).json(error);
    }
});

router.get('/debug/correos', async (req, res) => {
    try {
        const negocios = await Negocio.find({}, 'correo nombre');
        res.status(200).json(negocios.map(n => ({ correo: n.correo, nombre: n.nombre })));
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 3. RUTAS DE OFERTAS (Usando Query Params para evitar problemas con símbolos en la URL)
router.post('/ofertas/publicar', async (req, res) => {
    try {
        const correoStr = req.query.correo; // Recibido por ?correo=...
        console.log('📧 Intento de publicar oferta para:', correoStr);
        const { titulo, descripcion, descuento, imagenUrl, fechaFin } = req.body;
        
        if (!correoStr) return res.status(400).json({ error: "El correo es requerido en la URL (?correo=...)" });

        const negocio = await Negocio.findOne({ correo: { $regex: new RegExp("^" + correoStr + "$", "i") } });
        if (!negocio) return res.status(404).json({ error: "Negocio no encontrado" });

        const actualizado = await Negocio.findOneAndUpdate(
            { correo: negocio.correo },
            { $push: { ofertas: { titulo, descripcion, descuento, imagenUrl, fechaFin, activa: true } } },
            { new: true }
        );
        res.status(201).json({ ok: true, ofertas: actualizado.ofertas });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/ofertas/quitar', async (req, res) => {
    try {
        const { correo, ofertaId } = req.query;
        const negocio = await Negocio.findOneAndUpdate(
            { correo: { $regex: new RegExp("^" + correo + "$", "i") } },
            { $pull: { ofertas: { _id: ofertaId } } },
            { new: true }
        );
        if (!negocio) return res.status(404).json({ error: "Negocio no encontrado" });
        res.status(200).json({ ok: true, ofertas: negocio.ofertas });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. OTROS
router.get('/qr/:token', async (req, res) => {
    try {
        const negocio = await Negocio.findOne({ qrToken: req.params.token }, 'nombre correo qrToken');
        if (negocio) res.status(200).json(negocio);
        else res.status(404).json({ error: 'QR no válido' });
    } catch (error) {
        res.status(500).json(error);
    }
});

router.post('/:correo/resenas', async (req, res) => {
    try {
        const { usuarioNombre, texto, estrellas } = req.body;
        const negocio = await Negocio.findOneAndUpdate(
            { correo: { $regex: new RegExp("^" + req.params.correo + "$", "i") } },
            { $push: { resenas: { usuarioNombre, texto, estrellas: parseInt(estrellas) || 5 } } },
            { new: true }
        );
        res.status(200).json(negocio);
    } catch (error) {
        res.status(500).json(error);
    }
});

router.post('/:correo/visita', async (req, res) => {
    try {
        const negocio = await Negocio.findOneAndUpdate(
            { correo: { $regex: new RegExp("^" + req.params.correo + "$", "i") } },
            { $inc: { visitas: 1 } },
            { new: true }
        );
        if (negocio) res.status(200).json({ ok: true, visitas: negocio.visitas });
        else res.status(404).json({ error: 'Negocio no encontrado' });
    } catch (error) {
        res.status(500).json(error);
    }
});

router.post('/:correo/sello', async (req, res) => {
    try {
        const negocio = await Negocio.findOneAndUpdate(
            { correo: { $regex: new RegExp("^" + req.params.correo + "$", "i") } },
            { $inc: { sellosEmitidos: 1 } },
            { new: true }
        );
        if (negocio) res.status(200).json({ ok: true, sellos: negocio.sellosEmitidos });
        else res.status(404).json({ error: 'Negocio no encontrado' });
    } catch (error) {
        res.status(500).json(error);
    }
});

router.get('/:correo', async (req, res) => {
    try {
        const correo = decodeURIComponent(req.params.correo);
        const negocio = await Negocio.findOne({ correo: { $regex: new RegExp("^" + correo + "$", "i") } });
        if (negocio) res.status(200).json(normalizarUrls(negocio, req));
        else res.status(404).json({ error: "Negocio no encontrado" });
    } catch (error) {
        res.status(500).json(error);
    }
});

router.put('/:correo', async (req, res) => {
    try {
        const correo = decodeURIComponent(req.params.correo);
        const negocio = await Negocio.findOneAndUpdate(
            { correo: { $regex: new RegExp("^" + correo + "$", "i") } },
            { $set: req.body },
            { new: true }
        );
        if (negocio) res.status(200).json(negocio);
        else res.status(404).json({ error: "Negocio no encontrado" });
    } catch (error) {
        res.status(500).json(error);
    }
});

module.exports = router;
