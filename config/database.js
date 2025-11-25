const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Atlas conectado exitosamente`);
    console.log(`📊 Host: ${conn.connection.host}`);
    console.log(`🗄️  Base de datos: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ Error conectando a MongoDB Atlas: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

