require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const connectDB = require('./config/database');
const cloudinary = require('./config/cloudinary');

// Modelos
const Contenido = require('./models/Contenido');
const Categoria = require('./models/Categoria');
const Sugerencia = require('./models/Sugerencia');
const Usuario = require('./models/Usuario');
const Comentario = require('./models/Comentario');

const app = express();
const PORT = process.env.PORT || 3000;
const distPath = path.join(__dirname, 'frontend', 'dist');
const isDistBuilt = fs.existsSync(distPath);
const distIndexExists = fs.existsSync(path.join(distPath, 'index.html'));
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

console.log('📁 Paths estáticos configurados:');
console.log(`   distPath: ${distPath}`);
console.log(`   distPath existe: ${isDistBuilt}`);
console.log(`   dist/index.html existe: ${distIndexExists}`);

// Conectar a MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
if (isDistBuilt && distIndexExists) {
  console.log('✅ Sirviendo assets del build de Vue desde frontend/dist');
  app.use(express.static(distPath));
} else {
  console.error('❌ ERROR: No se encontró un build válido de Vue en frontend/dist');
  console.error('   Ejecuta: npm run build (desde la raíz del proyecto)');
}

// ==================== RUTAS API ====================

// GET - Obtener todos los contenidos (con filtros opcionales)
app.get('/api/contenidos', async (req, res) => {
  try {
    const { categoria, tipo } = req.query;
    let filtro = { activo: true };

    if (categoria) {
      filtro.categoria = new RegExp(categoria, 'i'); // Case insensitive
    }

    if (tipo) {
      filtro.tipo = tipo;
    }

    const contenidos = await Contenido.find(filtro).sort({ createdAt: -1 });
    res.json(contenidos);
  } catch (error) {
    console.error('Error al obtener contenidos:', error);
    res.status(500).json({ error: 'Error al obtener los contenidos' });
  }
});

// GET - Obtener un contenido por ID
app.get('/api/contenidos/:id', async (req, res) => {
  try {
    const contenido = await Contenido.findById(req.params.id);
    
    if (!contenido) {
      return res.status(404).json({ error: 'Contenido no encontrado' });
    }
    
    res.json(contenido);
  } catch (error) {
    console.error('Error al obtener contenido:', error);
    res.status(500).json({ error: 'Error al obtener el contenido' });
  }
});

// POST - Crear nuevo contenido
app.post('/api/contenidos', async (req, res) => {
  try {
    const nuevoContenido = new Contenido(req.body);
    await nuevoContenido.save();
    res.status(201).json(nuevoContenido);
  } catch (error) {
    console.error('Error al crear contenido:', error);
    res.status(400).json({ error: error.message });
  }
});

// PUT - Actualizar contenido
app.put('/api/contenidos/:id', async (req, res) => {
  try {
    const contenido = await Contenido.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!contenido) {
      return res.status(404).json({ error: 'Contenido no encontrado' });
    }
    
    res.json(contenido);
  } catch (error) {
    console.error('Error al actualizar contenido:', error);
    res.status(400).json({ error: error.message });
  }
});

// DELETE - Eliminar contenido (soft delete)
app.delete('/api/contenidos/:id', async (req, res) => {
  try {
    const contenido = await Contenido.findByIdAndUpdate(
      req.params.id,
      { activo: false },
      { new: true }
    );
    
    if (!contenido) {
      return res.status(404).json({ error: 'Contenido no encontrado' });
    }
    
    res.json({ mensaje: 'Contenido eliminado correctamente', contenido });
  } catch (error) {
    console.error('Error al eliminar contenido:', error);
    res.status(500).json({ error: 'Error al eliminar el contenido' });
  }
});

// GET - Obtener todas las categorías
app.get('/api/categorias', async (req, res) => {
  try {
    const categorias = await Categoria.find();
    res.json(categorias);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error al obtener las categorías' });
  }
});

// POST - Crear nueva categoría
app.post('/api/categorias', async (req, res) => {
  try {
    const nuevaCategoria = new Categoria(req.body);
    await nuevaCategoria.save();
    res.status(201).json(nuevaCategoria);
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(400).json({ error: error.message });
  }
});

// PUT - Actualizar categoría
app.put('/api/categorias/:id', async (req, res) => {
  try {
    const categoria = await Categoria.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!categoria) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.json(categoria);
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(400).json({ error: error.message });
  }
});

// DELETE - Eliminar categoría (hard delete)
app.delete('/api/categorias/:id', async (req, res) => {
  try {
    const categoria = await Categoria.findByIdAndDelete(req.params.id);
    if (!categoria) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    res.json({ mensaje: 'Categoría eliminada correctamente', categoria });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({ error: 'Error al eliminar la categoría' });
  }
});

// GET - Obtener todas las sugerencias
app.get('/api/sugerencias', async (req, res) => {
  try {
    const sugerencias = await Sugerencia.find().sort({ createdAt: -1 });
    res.json(sugerencias);
  } catch (error) {
    console.error('Error al obtener sugerencias:', error);
    res.status(500).json({ error: 'Error al obtener las sugerencias' });
  }
});

// POST - Crear nueva sugerencia
app.post('/api/sugerencias', async (req, res) => {
  try {
    const nuevaSugerencia = new Sugerencia(req.body);
    await nuevaSugerencia.save();
    
    res.status(201).json({ 
      mensaje: '¡Gracias por tu sugerencia! La revisaremos pronto.',
      sugerencia: nuevaSugerencia 
    });
  } catch (error) {
    console.error('Error al crear sugerencia:', error);
    res.status(400).json({ error: error.message });
  }
});

// PUT - Marcar sugerencia como leída
app.put('/api/sugerencias/:id/leida', async (req, res) => {
  try {
    const sugerencia = await Sugerencia.findByIdAndUpdate(
      req.params.id,
      { leida: true },
      { new: true }
    );
    
    if (!sugerencia) {
      return res.status(404).json({ error: 'Sugerencia no encontrada' });
    }
    
    res.json(sugerencia);
  } catch (error) {
    console.error('Error al actualizar sugerencia:', error);
    res.status(500).json({ error: 'Error al actualizar la sugerencia' });
  }
});

// PUT - Actualizar sugerencia (texto o campos básicos)
app.put('/api/sugerencias/:id', async (req, res) => {
  try {
    const sugerencia = await Sugerencia.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!sugerencia) {
      return res.status(404).json({ error: 'Sugerencia no encontrada' });
    }

    res.json(sugerencia);
  } catch (error) {
    console.error('Error al actualizar sugerencia:', error);
    res.status(400).json({ error: error.message });
  }
});

// DELETE - Eliminar sugerencia
app.delete('/api/sugerencias/:id', async (req, res) => {
  try {
    const sugerencia = await Sugerencia.findByIdAndDelete(req.params.id);
    if (!sugerencia) {
      return res.status(404).json({ error: 'Sugerencia no encontrada' });
    }
    res.json({ mensaje: 'Sugerencia eliminada correctamente', sugerencia });
  } catch (error) {
    console.error('Error al eliminar sugerencia:', error);
    res.status(500).json({ error: 'Error al eliminar la sugerencia' });
  }
});

// ==================== UPLOADS ====================

app.post('/api/uploads/infografia', upload.single('file'), async (req, res) => {
  try {
    if (!cloudinary.config().cloud_name) {
      return res.status(503).json({ error: 'Servicio de almacenamiento no disponible' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Archivo requerido' });
    }

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'equilibrio-universitario/infografias', resource_type: 'image' },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      stream.end(req.file.buffer);
    });

    res.json({
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      bytes: uploadResult.bytes,
      format: uploadResult.format,
    });
  } catch (error) {
    console.error('Error al subir infografía:', error);
    res.status(500).json({ error: 'No se pudo subir la infografía' });
  }
});

// ==================== RUTAS USUARIOS ====================

// GET - Obtener todos los usuarios
app.get('/api/usuarios', async (req, res) => {
  try {
    const usuarios = await Usuario.find({ activo: true })
      .select('-__v')
      .sort({ createdAt: -1 });
    res.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
});

// GET - Obtener un usuario por ID
app.get('/api/usuarios/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id)
      .populate('favoritos')
      .populate('historial.contenido');
    
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(usuario);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
});

// GET - Obtener usuario por correo
app.get('/api/usuarios/correo/:correo', async (req, res) => {
  try {
    const usuario = await Usuario.findOne({ 
      correo: req.params.correo.toLowerCase(),
      activo: true 
    })
      .populate('favoritos')
      .populate('historial.contenido');
    
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(usuario);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
});

// POST - Crear nuevo usuario (registro)
app.post('/api/usuarios', async (req, res) => {
  try {
    const { rol = 'estudiante', ...resto } = req.body;
    const rolNormalizado = typeof rol === 'string' ? rol.toLowerCase() : 'estudiante';
    if (!['admin', 'admin_t', 'estudiante'].includes(rolNormalizado)) {
      return res.status(400).json({ error: 'Rol inválido' });
    }

    const requiereAprobacionAdmin = rolNormalizado === 'admin';

    const nuevoUsuario = new Usuario({
      ...resto,
      rol: requiereAprobacionAdmin ? 'estudiante' : rolNormalizado,
      rolSolicitado: requiereAprobacionAdmin ? 'admin' : null,
      requiereAprobacionAdmin,
    });
    await nuevoUsuario.save();
    const usuarioJson = nuevoUsuario.toJSON();
    if (!usuarioJson.rol) {
      usuarioJson.rol = 'estudiante';
    }
    if (requiereAprobacionAdmin) {
      usuarioJson.mensaje = 'Solicitud de administrador enviada. Un administrador existente debe aprobar tu cuenta.';
    }
    res.status(201).json(usuarioJson);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }
    res.status(400).json({ error: error.message });
  }
});

// POST - Login de usuario
app.post('/api/usuarios/login', async (req, res) => {
  try {
    const { correo, contraseña } = req.body;
    
    if (!correo || !contraseña) {
      return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
    }
    
    const usuario = await Usuario.findOne({ 
      correo: correo.toLowerCase(),
      activo: true 
    });
    
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const contraseñaValida = await usuario.verificarContraseña(contraseña);
    if (!contraseñaValida) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    // Login exitoso - devolver usuario sin contraseña
    const usuarioJson = usuario.toJSON();
    if (!usuarioJson.rol) {
      usuarioJson.rol = 'estudiante';
    }

    res.json({ 
      mensaje: 'Login exitoso',
      usuario: usuarioJson,
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// PUT - Actualizar usuario
app.put('/api/usuarios/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(usuario);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(400).json({ error: error.message });
  }
});

// DELETE - Eliminar usuario (soft delete)
app.delete('/api/usuarios/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      { activo: false },
      { new: true }
    );
    
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json({ mensaje: 'Usuario eliminado correctamente', usuario });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
});

// POST - Agregar contenido a favoritos
app.post('/api/usuarios/:id/favoritos/:contenidoId', async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    await usuario.agregarFavorito(req.params.contenidoId);
    await usuario.populate('favoritos');
    
    res.json({ 
      mensaje: 'Contenido agregado a favoritos',
      favoritos: usuario.favoritos 
    });
  } catch (error) {
    console.error('Error al agregar favorito:', error);
    res.status(500).json({ error: 'Error al agregar a favoritos' });
  }
});

// DELETE - Eliminar de favoritos
app.delete('/api/usuarios/:id/favoritos/:contenidoId', async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    await usuario.eliminarFavorito(req.params.contenidoId);
    await usuario.populate('favoritos');
    
    res.json({ 
      mensaje: 'Contenido eliminado de favoritos',
      favoritos: usuario.favoritos 
    });
  } catch (error) {
    console.error('Error al eliminar favorito:', error);
    res.status(500).json({ error: 'Error al eliminar de favoritos' });
  }
});

// POST - Agregar al historial
app.post('/api/usuarios/:id/historial/:contenidoId', async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    await usuario.agregarAlHistorial(req.params.contenidoId);
    await usuario.populate('historial.contenido');
    
    res.json({ 
      mensaje: 'Contenido agregado al historial',
      historial: usuario.historial 
    });
  } catch (error) {
    console.error('Error al agregar al historial:', error);
    res.status(500).json({ error: 'Error al agregar al historial' });
  }
});

// ==================== COMENTARIOS ====================

// GET - Comentarios por recurso
app.get('/api/contenidos/:id/comentarios', async (req, res) => {
  try {
    const { id } = req.params;
    const comentarios = await Comentario.find({ recurso: id, aprobado: true })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    res.json(comentarios);
  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    res.status(500).json({ error: 'Error al obtener los comentarios' });
  }
});

// POST - Crear comentario
app.post('/api/contenidos/:id/comentarios', async (req, res) => {
  try {
    const { id } = req.params;
    const { autorId, texto } = req.body;

    if (!autorId || !texto?.trim()) {
      return res.status(400).json({ error: 'Autor y texto son requeridos' });
    }

    const [contenido, autor] = await Promise.all([
      Contenido.findById(id),
      Usuario.findById(autorId),
    ]);

    if (!contenido) {
      return res.status(404).json({ error: 'Contenido no encontrado' });
    }

    if (!autor || !autor.activo) {
      return res.status(403).json({ error: 'Usuario no autorizado' });
    }

    const nuevoComentario = await Comentario.create({
      recurso: contenido._id,
      autor: autor._id,
      autorNombre: autor.nombre,
      autorCorreo: autor.correo,
      texto: texto.trim(),
      aprobado: true,
    });

    res.status(201).json(nuevoComentario);
  } catch (error) {
    console.error('Error al crear comentario:', error);
    res.status(500).json({ error: 'Error al crear el comentario' });
  }
});

// DELETE - Eliminar comentario (soft delete)
app.delete('/api/comentarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const comentario = await Comentario.findByIdAndUpdate(
      id,
      { aprobado: false },
      { new: true }
    );
    if (!comentario) {
      return res.status(404).json({ error: 'Comentario no encontrado' });
    }
    res.json({ mensaje: 'Comentario eliminado', comentario });
  } catch (error) {
    console.error('Error al eliminar comentario:', error);
    res.status(500).json({ error: 'Error al eliminar el comentario' });
  }
});

// GET - Solicitudes pendientes de administrador
app.get('/api/usuarios/admin/pendientes', async (_req, res) => {
  try {
    const pendientes = await Usuario.find({
      rolSolicitado: 'admin',
      requiereAprobacionAdmin: true,
      activo: true,
    })
      .select('-contraseña -__v')
      .sort({ createdAt: 1 });
    res.json(pendientes);
  } catch (error) {
    console.error('Error al obtener solicitudes de administrador:', error);
    res.status(500).json({ error: 'Error al obtener las solicitudes' });
  }
});

// DELETE - Cancelar solicitud de administrador
app.delete('/api/usuarios/:id/solicitud-admin', async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (usuario.rolSolicitado !== 'admin' || !usuario.requiereAprobacionAdmin) {
      return res.status(400).json({ error: 'El usuario no tiene una solicitud pendiente de administrador' });
    }

    usuario.rolSolicitado = null;
    usuario.requiereAprobacionAdmin = false;
    await usuario.save();

    res.json({ mensaje: 'Solicitud de administrador cancelada', usuario: usuario.toJSON() });
  } catch (error) {
    console.error('Error al cancelar solicitud de administrador:', error);
    res.status(500).json({ error: 'Error al cancelar la solicitud' });
  }
});

// PUT - Aprobar solicitud de administrador
app.put('/api/usuarios/:id/aprobar-admin', async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (usuario.rol === 'admin') {
      return res.status(400).json({ error: 'El usuario ya es administrador' });
    }

    if (usuario.rolSolicitado !== 'admin' || !usuario.requiereAprobacionAdmin) {
      return res.status(400).json({ error: 'El usuario no tiene una solicitud pendiente de administrador' });
    }

    usuario.rol = 'admin_t';
    usuario.rolSolicitado = null;
    usuario.requiereAprobacionAdmin = false;
    await usuario.save();

    const usuarioJson = usuario.toJSON();
    res.json({ mensaje: 'Usuario promovido a administrador', usuario: usuarioJson });
  } catch (error) {
    console.error('Error al aprobar administrador:', error);
    res.status(500).json({ error: 'Error al aprobar al administrador' });
  }
});

// GET - Listar administradores activos
app.get('/api/admin/usuarios', async (_req, res) => {
  try {
    const administradores = await Usuario.find({
      rol: { $in: ['admin', 'admin_t'] },
      activo: true,
    })
      .select('-contraseña -__v')
      .sort({ createdAt: 1 });
    res.json(administradores);
  } catch (error) {
    console.error('Error al obtener administradores:', error);
    res.status(500).json({ error: 'Error al obtener los administradores' });
  }
});

// PUT - Promover usuario a administrador temporal
app.put('/api/admin/usuarios/:id/promover', async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (usuario.correo === 'admin@admin.com') {
      return res.status(400).json({ error: 'La cuenta principal ya es administrador permanente' });
    }

    if (usuario.rol === 'admin') {
      return res.status(400).json({ error: 'El administrador principal ya es permanente' });
    }

    if (usuario.rol === 'admin_t') {
      return res.status(200).json({ mensaje: 'El usuario ya es administrador temporal', usuario: usuario.toJSON() });
    }

    usuario.rol = 'admin_t';
    usuario.rolSolicitado = null;
    usuario.requiereAprobacionAdmin = false;
    await usuario.save();

    res.json({
      mensaje: 'Usuario promovido a administrador temporal',
      usuario: usuario.toJSON(),
    });
  } catch (error) {
    console.error('Error al promover administrador:', error);
    res.status(500).json({ error: 'Error al promover al administrador' });
  }
});

// PUT - Promover usuario por correo
app.put('/api/admin/usuarios/promover-por-correo', async (req, res) => {
  try {
    const { correo } = req.body ?? {};
    if (!correo?.trim()) {
      return res.status(400).json({ error: 'Correo requerido' });
    }

    const usuario = await Usuario.findOne({ correo: correo.trim().toLowerCase(), activo: true });
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (usuario.correo === 'admin@admin.com') {
      return res.status(400).json({ error: 'La cuenta principal ya es administrador permanente' });
    }

    if (usuario.rol === 'admin_t') {
      return res.status(200).json({ mensaje: 'El usuario ya es administrador temporal', usuario: usuario.toJSON() });
    }

    usuario.rol = 'admin_t';
    usuario.rolSolicitado = null;
    usuario.requiereAprobacionAdmin = false;
    await usuario.save();

    res.json({
      mensaje: 'Usuario promovido a administrador temporal',
      usuario: usuario.toJSON(),
    });
  } catch (error) {
    console.error('Error al promover por correo:', error);
    res.status(500).json({ error: 'Error al promover al administrador' });
  }
});

// DELETE - Remover privilegios de administrador
app.delete('/api/admin/usuarios/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (usuario.correo === 'admin@admin.com') {
      return res.status(400).json({ error: 'No se puede remover al administrador principal' });
    }

    if (!['admin', 'admin_t'].includes(usuario.rol)) {
      return res.status(400).json({ error: 'El usuario no es administrador' });
    }

    usuario.rol = 'estudiante';
    usuario.rolSolicitado = null;
    usuario.requiereAprobacionAdmin = false;
    usuario.rolSolicitado = null;
    usuario.requiereAprobacionAdmin = false;
    await usuario.save();

    res.json({ mensaje: 'Privilegios de administrador removidos', usuario: usuario.toJSON() });
  } catch (error) {
    console.error('Error al remover administrador:', error);
    res.status(500).json({ error: 'Error al remover al administrador' });
  }
});

// Ruta principal (SPA)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }

  if (isDistBuilt && distIndexExists) {
    return res.sendFile(path.join(distPath, 'index.html'));
  }

  res.status(500).send(`
    <html>
      <head><title>Error - Build no encontrado</title></head>
      <body style="font-family: Arial; padding: 2rem; text-align: center;">
        <h1>❌ Build de Vue no encontrado</h1>
        <p>Por favor ejecuta: <code>npm run build</code></p>
        <p>Esto generará los archivos necesarios en <code>frontend/dist</code></p>
      </body>
    </html>
  `);
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📚 Equilibrio Universitario - Plataforma para estudiantes`);
});

