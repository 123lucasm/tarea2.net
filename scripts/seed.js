require('dotenv').config();
const mongoose = require('mongoose');
const Contenido = require('../models/Contenido');
const Categoria = require('../models/Categoria');
const Usuario = require('../models/Usuario');
const Sugerencia = require('../models/Sugerencia');

const connectDB = async () => {
  try {
    // En Mongoose 8.x, las opciones deprecadas ya no son necesarias
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB Atlas');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

const categoriasIniciales = [
  { 
    nombre: 'Productividad', 
    descripcion: 'Herramientas y técnicas para mejorar tu rendimiento' 
  },
  { 
    nombre: 'Estudio', 
    descripcion: 'Métodos y estrategias de aprendizaje efectivo' 
  },
  { 
    nombre: 'Bienestar', 
    descripcion: 'Cuida tu salud física y mental' 
  }
];

const contenidosIniciales = [
  {
    titulo: 'Organización del Tiempo',
    tipo: 'infografia',
    tema: 'productividad',
    descripcion: 'Aprende a gestionar tu tiempo de manera eficiente con técnicas probadas.',
    enlace: '/assets/infografias/organizacion-tiempo.jpg',
    categoria: 'Productividad'
  },
  {
    titulo: 'Técnicas de Estudio Efectivas',
    tipo: 'video',
    tema: 'estudio',
    descripcion: 'Descubre métodos de estudio que realmente funcionan.',
    enlace: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    categoria: 'Estudio'
  },
  {
    titulo: 'Manejo del Estrés',
    tipo: 'infografia',
    tema: 'bienestar',
    descripcion: 'Estrategias para reducir el estrés durante épocas de exámenes.',
    enlace: '/assets/infografias/manejo-estres.jpg',
    categoria: 'Bienestar'
  },
  {
    titulo: 'Hábitos Saludables',
    tipo: 'video',
    tema: 'bienestar',
    descripcion: 'Consejos para mantener un estilo de vida saludable mientras estudias.',
    enlace: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    categoria: 'Bienestar'
  },
  {
    titulo: 'Preparación para Exámenes',
    tipo: 'infografia',
    tema: 'estudio',
    descripcion: 'Guía paso a paso para prepararte efectivamente para tus exámenes.',
    enlace: '/assets/infografias/preparacion-examenes.jpg',
    categoria: 'Estudio'
  },
  {
    titulo: 'Balance Vida-Estudio',
    tipo: 'video',
    tema: 'productividad',
    descripcion: 'Cómo mantener un equilibrio saludable entre tu vida personal y académica.',
    enlace: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    categoria: 'Productividad'
  }
];

const usuariosIniciales = [
  {
    nombre: 'María García',
    correo: 'maria.garcia@universidad.edu',
    contraseña: 'password123'
  },
  {
    nombre: 'Juan Pérez',
    correo: 'juan.perez@universidad.edu',
    contraseña: 'password123'
  },
  {
    nombre: 'Ana López',
    correo: 'ana.lopez@universidad.edu',
    contraseña: 'password123'
  }
];

const seedDatabase = async () => {
  try {
    console.log('🌱 Iniciando seed de la base de datos...');

    // Limpiar colecciones existentes
    await Categoria.deleteMany({});
    await Contenido.deleteMany({});
    await Usuario.deleteMany({});
    console.log('🗑️  Datos antiguos eliminados');

    // Insertar categorías
    const categoriasCreadas = await Categoria.insertMany(categoriasIniciales);
    console.log(`✅ ${categoriasCreadas.length} categorías creadas`);

    // Insertar contenidos
    const contenidosCreados = await Contenido.insertMany(contenidosIniciales);
    console.log(`✅ ${contenidosCreados.length} contenidos creados`);

    // Insertar usuarios
    const usuariosCreados = await Usuario.insertMany(usuariosIniciales);
    console.log(`✅ ${usuariosCreados.length} usuarios creados`);

    console.log('\n🎉 ¡Seed completado exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`   - Categorías: ${categoriasCreadas.length}`);
    console.log(`   - Contenidos: ${contenidosCreados.length}`);
    console.log(`   - Usuarios: ${usuariosCreados.length}`);
    console.log('\n✨ La base de datos está lista para usar\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    process.exit(1);
  }
};

// Ejecutar seed
connectDB().then(() => seedDatabase());

