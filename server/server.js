// ✅ 1. Load environment variables immediately
require('dotenv').config();

// ✅ 2. Load dependencies
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');





// ✅ 3. Local imports (after env is loaded)
const connectDb = require('./Lib/connectDb');
const authRoutes = require('./Routes/authRoutes');
require('./config/passportConfig'); // ✅ after env

// ✅ 4. Initialize Express
const app = express();

// ✅ 5. Connect to MongoDB
connectDb();

// ✅ 6. Middleware

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// ✅ 7. Routes
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ✅ 8. Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
