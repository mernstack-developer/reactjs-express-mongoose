const express = require('express');
  // const cors = require('cors');
 const mongoose = require('mongoose');
  const userRoutes = require('./routes/user.routes');
  const authRoutes = require('./routes/auth.routes');
 const dotenv = require('dotenv');
 dotenv.config();
const app = express();
//app.use(cors()); 
app.use(express.json());
// Connect to MongoDB
 const mongoUri = process.env.MONGODB_URI || process.env.DB_URI;
 if (!mongoUri) {
   console.error(`No MongoDB connection string found in ${mongoUri} or DB_URI`);
   process.exit(1);
 }
 mongoose.connect(mongoUri, {
   useNewUrlParser: true,
       useUnifiedTopology: true,
       serverSelectionTimeoutMS: 30000, // 30 seconds
       socketTimeoutMS: 45000,
 })
 .then(() => console.log('Connected to MongoDB Atlas'))
 .catch(err => console.error('MongoDB connection error:', err));
 //Example Mongoose Model (e.g., in a models/ folder)
 app.use('/api/users', userRoutes);
 app.use('/api/auth', authRoutes);
// A simple API route
app.get('/api/greeting', (req, res) => {
  res.json({ message: 'Hello from the Express server!' });
});

module.exports = app;

const port = process.env.PORT || 3000;
// For local development: Listen on port

 if (process.env.NODE_ENV !== 'production') {
   app.listen(port, () => {
     console.log(`Server listening on port ${port}`);
   });
 }