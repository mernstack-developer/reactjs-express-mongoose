const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const userRoutes = require('./routes/user.routes');

dotenv.config();
const authRoutes = require('./routes/auth.routes');

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// Simple health route
app.get('/api/greeting', (req, res) => {
  res.json({ message: 'Hello from the Express server!' });
});

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || process.env.DB_URI;
if (!mongoUri) {
  console.error('No MongoDB connection string found in MONGODB_URI or DB_URI');
  process.exit(1);
}

mongoose.connect(mongoUri, {
  // useNewUrlParser and useUnifiedTopology are no longer required in mongoose v6+
})
  .then(() => {
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Server started on port ${port}`));
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });

module.exports = app;
