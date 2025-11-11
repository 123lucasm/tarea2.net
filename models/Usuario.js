const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  correo: {
    type: String,
    required: [true, 'El correo es requerido'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor ingresa un correo válido']
  },
  contraseña: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
  },
  rol: {
    type: String,
    enum: ['admin', 'estudiante'],
    default: 'estudiante'
  },
  rolSolicitado: {
    type: String,
    enum: ['admin', null],
    default: null
  },
  requiereAprobacionAdmin: {
    type: Boolean,
    default: false
  },
  activo: {
    type: Boolean,
    default: true
  },
  // Contenidos favoritos del usuario
  favoritos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contenido'
  }],
  // Historial de contenidos vistos
  historial: [{
    contenido: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contenido'
    },
    fechaVisto: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Índice para búsquedas más rápidas por correo
usuarioSchema.index({ correo: 1 });

// No incluir la contraseña en las respuestas JSON
usuarioSchema.set('toJSON', {
  transform: function(doc, ret, options) {
    delete ret.contraseña;
    delete ret.__v;
    return ret;
  }
});

// Método para agregar contenido a favoritos
usuarioSchema.methods.agregarFavorito = async function(contenidoId) {
  if (!this.favoritos.includes(contenidoId)) {
    this.favoritos.push(contenidoId);
    await this.save();
  }
  return this;
};

// Método para eliminar de favoritos
usuarioSchema.methods.eliminarFavorito = async function(contenidoId) {
  this.favoritos = this.favoritos.filter(id => id.toString() !== contenidoId.toString());
  await this.save();
  return this;
};

// Método para agregar al historial
usuarioSchema.methods.agregarAlHistorial = async function(contenidoId) {
  // Evitar duplicados recientes (dentro de las últimas 24 horas)
  const yaVisto = this.historial.find(h => 
    h.contenido.toString() === contenidoId.toString() &&
    (Date.now() - h.fechaVisto) < 86400000 // 24 horas en milisegundos
  );
  
  if (!yaVisto) {
    this.historial.push({
      contenido: contenidoId,
      fechaVisto: new Date()
    });
    
    // Mantener solo los últimos 50 registros del historial
    if (this.historial.length > 50) {
      this.historial = this.historial.slice(-50);
    }
    
    await this.save();
  }
  
  return this;
};

module.exports = mongoose.model('Usuario', usuarioSchema);

