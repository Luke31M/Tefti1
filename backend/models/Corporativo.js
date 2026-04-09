const mongoose = require('mongoose');

const CorporativoSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    tipo: { type: String, default: 'corporativo' },
    correo: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    giro: { type: String },
    descripcion: { type: String },
    imagenUrl: { type: String },
    visitas: { type: Number, default: 0 },
    sellosEmitidos: { type: Number, default: 0 },
    qrToken: { type: String, unique: true, sparse: true },
    ofertas: [{
        titulo: { type: String },
        descripcion: { type: String },
        descuento: { type: String },
        imagenUrl: { type: String },
        fechaFin: { type: Date },
        activa: { type: Boolean, default: true },
        creadaEn: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Corporativo', CorporativoSchema);
