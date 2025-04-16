const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('Connection string: mongodb://localhost:27017/expense-tracker');
    
    const conn = await mongoose.connect('mongodb://localhost:27017/expense-tracker', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database name: ${conn.connection.name}`);
    console.log(`MongoDB version: ${conn.connection.db.admin().buildInfo().version}`);
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Please make sure MongoDB is installed and running on your system.');
    console.error('You can download MongoDB from: https://www.mongodb.com/try/download/community');
    process.exit(1);
  }
};

module.exports = connectDB; 