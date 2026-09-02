const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker';
    
    // Mongoose v6+ doesn't need useNewUrlParser and useUnifiedTopology
    // These options are deprecated and cause errors in newer versions
    await mongoose.connect(mongoURI);
    
    console.log('✅ MongoDB connected successfully');
    console.log(`📦 Database: ${mongoose.connection.name}`);
    console.log(`🔗 Connection: ${mongoose.connection.host}:${mongoose.connection.port}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('💡 Make sure MongoDB is running on port 27017');
    // Don't exit - let server continue (useful for development)
    // process.exit(1);
  }
};

module.exports = connectDB;
