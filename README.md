# 📚 Equilibrio Universitario

Plataforma web interactiva diseñada para ayudar a estudiantes universitarios de primer año a encontrar un equilibrio entre las exigencias académicas y su vida cotidiana.

## 🎯 Objetivo

Desarrollar un prototipo web interactivo que proporcione recursos, herramientas y acompañamiento entre pares para mejorar el equilibrio entre la vida académica y personal de los estudiantes.

## ✨ Características

### 📖 Recursos Educativos
- **Infografías** con consejos sobre organización del tiempo, estrategias para exámenes, gestión del estrés y hábitos saludables
- **Videos cortos** con experiencias y tips de otros estudiantes
- Sistema de **filtrado y búsqueda** por categorías y temas

### 👥 Comunidad
- Integración con **Discord** para chat en tiempo real
- Grupo de **WhatsApp** para apoyo entre estudiantes
- Sección de **Preguntas Frecuentes** (FAQ)

### 💬 Interacción
- **Formulario de sugerencias** para proponer nuevos temas
- Participación comunitaria para compartir experiencias

### 📱 Diseño Responsive
- Totalmente adaptable para PC, tablet y móvil
- Interfaz moderna y amigable
- Navegación intuitiva

## 🛠️ Tecnologías Utilizadas

- **Backend:** Node.js + Express
- **Base de Datos:** MongoDB Atlas (cloud)
- **ODM:** Mongoose
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Estilos:** CSS personalizado con variables CSS
- **Fuentes:** Google Fonts (Poppins)

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) (versión 14 o superior)
- npm (incluido con Node.js)
- Cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (gratis)

## 🚀 Instalación y Configuración

### 1. Clonar o descargar el proyecto

```bash
# Si usas git
git clone <url-del-repositorio>

# O simplemente descarga el proyecto
```

### 2. Navegar al directorio del proyecto

```bash
cd "D:\.NET y RPYL"
```

### 3. Instalar dependencias

```bash
npm install
```

Este comando instalará todas las dependencias necesarias:
- express
- mongoose
- body-parser
- cors
- dotenv
- nodemon (para desarrollo)

### 4. Configurar variables de entorno

El archivo `.env` ya debe estar creado con:

```env
PORT=3000
MONGO_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/tarea2_net?retryWrites=true&w=majority&appName=Cluster0
```

**Nota:** Si trabajas con tu propio MongoDB Atlas, reemplaza con tu connection string.

### 5. Cargar datos iniciales (seed)

Antes de iniciar el servidor por primera vez, carga los datos de ejemplo:

```bash
npm run seed
```

Esto creará:
- 3 categorías (Productividad, Estudio, Bienestar)
- 6 contenidos de ejemplo

Deberías ver:
```
✅ Conectado a MongoDB
🗑️  Datos antiguos eliminados
✅ 3 categorías creadas
✅ 6 contenidos creados
🎉 ¡Seed completado exitosamente!
```

### 6. Iniciar el servidor

#### Modo producción:
```bash
npm start
```

#### Modo desarrollo (con auto-recarga):
```bash
npm run dev
```

### 7. Abrir en el navegador

Una vez que el servidor esté corriendo, abre tu navegador y ve a:

```
http://localhost:3000
```

Deberías ver en la consola:
```
✅ MongoDB conectado: cluster0.lo59dri.mongodb.net
📊 Base de datos: tarea2_net
🚀 Servidor corriendo en http://localhost:3000
📚 Equilibrio Universitario - Plataforma para estudiantes
```

## 📁 Estructura del Proyecto

```
D:\.NET y RPYL/
│
├── config/                 # Configuraciones
│   └── database.js        # Configuración de MongoDB
│
├── models/                # Modelos de Mongoose
│   ├── Categoria.js      # Modelo de Categoría
│   ├── Contenido.js      # Modelo de Contenido
│   └── Sugerencia.js     # Modelo de Sugerencia
│
├── scripts/              # Scripts de utilidad
│   └── seed.js          # Script para cargar datos iniciales
│
├── public/               # Archivos estáticos (frontend)
│   ├── css/
│   │   └── styles.css   # Estilos principales
│   ├── js/
│   │   └── app.js       # Lógica del frontend
│   └── index.html       # Página principal
│
├── .env                  # Variables de entorno (NO subir a git)
├── .gitignore           # Archivos ignorados por git
├── server.js            # Servidor Express (backend)
├── package.json         # Configuración y dependencias
└── README.md            # Este archivo
```

## 🔧 Scripts Disponibles

```bash
npm start        # Inicia el servidor en modo producción
npm run dev      # Inicia el servidor en modo desarrollo (con nodemon)
npm run seed     # Carga datos iniciales en la base de datos
```

## 📊 Modelos de Datos (Mongoose)

### Contenido
```javascript
{
  titulo: String (requerido),
  tipo: String (enum: ['infografia', 'video']),
  tema: String (requerido),
  descripcion: String (requerido),
  enlace: String (requerido),
  categoria: String (requerido),
  activo: Boolean (default: true),
  timestamps: true
}
```

### Categoría
```javascript
{
  nombre: String (requerido, único),
  descripcion: String (requerido),
  timestamps: true
}
```

### Sugerencia
```javascript
{
  nombre: String (default: 'Anónimo'),
  correo: String (validación de email),
  texto: String (requerido, min: 10 caracteres),
  leida: Boolean (default: false),
  timestamps: true
}
```

## 🌐 API Endpoints

### Contenidos

- `GET /api/contenidos` - Obtener todos los contenidos
  - Query params: `?categoria=Productividad&tipo=video`
- `GET /api/contenidos/:id` - Obtener un contenido por ID
- `POST /api/contenidos` - Crear nuevo contenido
- `PUT /api/contenidos/:id` - Actualizar contenido
- `DELETE /api/contenidos/:id` - Eliminar contenido (soft delete)

### Categorías

- `GET /api/categorias` - Obtener todas las categorías
- `POST /api/categorias` - Crear nueva categoría

### Sugerencias

- `GET /api/sugerencias` - Obtener todas las sugerencias
- `POST /api/sugerencias` - Crear nueva sugerencia
- `PUT /api/sugerencias/:id/leida` - Marcar como leída

## 🎨 Personalización

### Colores

Los colores principales se definen en `public/css/styles.css`:

```css
:root {
    --primary-color: #6366f1;
    --secondary-color: #8b5cf6;
    --accent-color: #ec4899;
}
```

### Enlaces de Comunidad

Para personalizar los enlaces de Discord y WhatsApp:

1. Abre `public/index.html`
2. Busca la sección de comunidad
3. Reemplaza:
   - Discord: `https://discord.gg/tuservidor`
   - WhatsApp: `https://chat.whatsapp.com/tugrupo`

### Agregar Contenidos

Puedes agregar contenidos de tres formas:

1. **Via API:** Usando Postman o Thunder Client
2. **Directamente en MongoDB Atlas:** En la interfaz web
3. **Editando seed.js:** Agregar al array `contenidosIniciales` y ejecutar `npm run seed`

## 🧪 Probando la API

Puedes usar **Thunder Client** (extensión de VS Code) o **Postman**:

### Ejemplo: Crear nuevo contenido
```http
POST http://localhost:3000/api/contenidos
Content-Type: application/json

{
  "titulo": "Técnica Pomodoro",
  "tipo": "infografia",
  "tema": "productividad",
  "descripcion": "Aprende a usar la técnica Pomodoro para mejorar tu concentración",
  "enlace": "/assets/infografias/pomodoro.jpg",
  "categoria": "Productividad"
}
```

## 🔒 Seguridad

- ✅ Variables sensibles en `.env` (no se suben a git)
- ✅ `.gitignore` configurado correctamente
- ✅ Validación de datos con Mongoose
- ✅ Manejo de errores en todas las rutas

## 🐛 Solución de Problemas

### Error: "MongooseError: The `uri` parameter to `openUri()` must be a string"
- **Solución:** Verifica que el archivo `.env` existe y tiene `MONGO_URI` correctamente configurado

### Error: "Authentication failed"
- **Solución:** Verifica el usuario y contraseña en MongoDB Atlas
- Asegúrate de que tu IP está en la lista blanca (Network Access)

### La página no carga contenidos
- **Solución:** Ejecuta `npm run seed` para cargar datos iniciales
- Verifica la conexión a MongoDB en la consola

## 📝 Diferencias del Prototipo vs Producción

### Actual (Prototipo)
- ✅ Base de datos MongoDB Atlas
- ✅ API REST completa (CRUD)
- ✅ Datos dinámicos
- ✅ Frontend con fetch a API
- ⚠️ Sin autenticación de usuarios
- ⚠️ Enlaces externos a Discord/WhatsApp

### Mejoras Futuras
- Sistema de autenticación (JWT)
- Panel de administración
- Chat interno
- Upload de archivos (infografías)
- Sistema de notificaciones
- Gamificación

## 🤝 Contribución

Este es un proyecto estudiantil. Para contribuir:

1. Haz fork del proyecto
2. Crea una rama: `git checkout -b feature/NuevaCaracteristica`
3. Commit: `git commit -m 'Agregar nueva característica'`
4. Push: `git push origin feature/NuevaCaracteristica`
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 👨‍💻 Equipo

Proyecto desarrollado por estudiantes universitarios para ayudar a la comunidad estudiantil.

---

**¡Gracias por usar Equilibrio Universitario! 🎓✨**

**Base de datos:** tarea2_net en MongoDB Atlas


# tarea2.net
