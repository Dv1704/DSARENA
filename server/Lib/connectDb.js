const mongoose = require('mongoose');
const dotenv=require("dotenv")

dotenv.config()

// Function to connect to MongoDB
const connectDb = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
    
    });

    console.log('Successfully connected to the database');
  } catch (error) {
    console.error('Error connecting to the database:', error);
    process.exit(1); // Exit the process if the connection fails
  }
};

// Export the function to use it in other parts of the app
module.exports = connectDb;
