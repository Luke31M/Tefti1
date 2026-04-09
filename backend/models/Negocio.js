const mongoose = require('mongoose');

const NegocioSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    tipo: { type: String, enum: ['local', 'corporativo'], default: 'local' }, // Corporativo = Empresas grandes
    correo: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    categoria: { type: String, required: false }, // Para locales
    giro: { type: String, required: false },      // Para corporativos (centro comercial, restaurante, etc)
    descripcion: { type: String, required: false },
    direccion: { type: String, required: false, default: "" }, // Ahora opcional para corporativos
    telefono: { type: String, required: false },
    imagenUrl: { type: String, required: false },
    productos: [{
        nombre: String,
        precio: String, // String para permitir símbolos de moneda libremente
        imagenUrl: String
    }],
    visitas: { type: Number, default: 0 },
    sellosEmitidos: { type: Number, default: 0 },
    resenas: [{
        usuarioNombre: String,
        texto: String,
        estrellas: { type: Number, default: 5 },
        fecha: { type: Date, default: Date.now },
        respuestaLocatario: String
    }],
    detallesEspecificos: { type: mongoose.Schema.Types.Mixed },
    horarios: {
        lunes: { apertura: { type: String, default: "09:00" }, cierre: { type: String, default: "18:00" }, cerrado: { type: Boolean, default: false } },
        martes: { apertura: { type: String, default: "09:00" }, cierre: { type: String, default: "18:00" }, cerrado: { type: Boolean, default: false } },
        miercoles: { apertura: { type: String, default: "09:00" }, cierre: { type: String, default: "18:00" }, cerrado: { type: Boolean, default: false } },
        jueves: { apertura: { type: String, default: "09:00" }, cierre: { type: String, default: "18:00" }, cerrado: { type: Boolean, default: false } },
        viernes: { apertura: { type: String, default: "09:00" }, cierre: { type: String, default: "18:00" }, cerrado: { type: Boolean, default: false } },
        sabado: { apertura: { type: String, default: "09:00" }, cierre: { type: String, default: "14:00" }, cerrado: { type: Boolean, default: false } },
        domingo: { apertura: { type: String, default: "09:00" }, cierre: { type: String, default: "14:00" }, cerrado: { type: Boolean, default: true } }
    },
    propietario: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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

module.exports = mongoose.model('Negocio', NegocioSchema);
