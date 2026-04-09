const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    correo: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    rol: { type: String, default: 'cliente' },
    puntos: { type: Number, default: 0 },
    sellos: [{
        negocioCorreo: String,
        negocioNombre: String,
        puntosGanados: { type: Number, default: 10 },
        fecha: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
