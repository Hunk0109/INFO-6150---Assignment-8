// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

// Set up Express app
const app = express();
const PORT = process.env.PORT || 3000;
//pass : Harsh@123
// Connect to MongoDB (replace 'your_database_url' with your actual MongoDB URL)
mongoose.connect('mongodb+srv://harshsangani1999:Harsh%40123@cluster0.nqxrx4e.mongodb.net/<your_database_name>', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

// Define User schema
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Create User model
const User = mongoose.model('User', userSchema);

// Middleware for parsing JSON requests
app.use(bodyParser.json());

// API Endpoint: User Creation
app.post('/user/create', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Validate email
    // Use a regex or a library like validator to perform more comprehensive validation
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: 'Invalid email, password, or full name.' });
    }

    // Validate password strength
    // You can implement your own rules or use a library like zxcvbn for more sophisticated checks
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }

    // Hash the password before saving to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    // Save user to the database
    await newUser.save();

    res.status(201).json({ message: 'User created successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// API Endpoint: User Edit
app.put('/user/edit', async (req, res) => {
  try {
    const { email, fullName, password } = req.body;

    // Check if req.body is defined
    if (!req.body || !email || !fullName || !password) {
      return res.status(400).json({ message: 'Invalid request. Please provide email, fullName, and password for editing.' });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email address format.' });
    }

    // Check if the user exists
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found. Cannot update details for a non-existing user.' });
    }

    // Hash the new password before updating
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user details
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { $set: { fullName, password: hashedPassword } },
      { new: true }
    );

    res.status(200).json({ message: 'User details updated successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// API Endpoint: User Delete
app.delete('/user/delete', async (req, res) => {
  try {
    const { email } = req.body;

    // Delete user by email
    const deletedUser = await User.findOneAndDelete({ email });

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// API Endpoint: Get All Users
app.get('/user/getAll', async (req, res) => {
  try {
    // Retrieve all users' full name, email, and password (for demonstration purposes only, never expose passwords in a real application)
    const users = await User.find({}, { fullName: 1, email: 1, password: 1 });

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
