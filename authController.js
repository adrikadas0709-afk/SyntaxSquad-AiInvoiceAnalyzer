const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// @desc    Register a new user
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Input Validation: Guard against missing incoming body fields
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: "Please provide all required fields: name, email, and password." 
      });
    }

    // 2. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    // 3. Create the user record (Password hashing happens in the model pre-save middleware)
    const user = await User.create({
      name,
      email,
      password
    });

    // 4. Return user profile metadata alongside active JWT authorization token
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id)
    });

  } catch (error) {
    console.error("Registration Server Error:", error);
    res.status(500).json({ 
      message: "Server encountered an error creating your profile.", 
      error: error.message 
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Input Validation: Ensure login payloads aren't blank strings
    if (!email || !password) {
      return res.status(400).json({ 
        message: "Please enter both an email and password to log in." 
      });
    }

    // 2. Locate user profile document
    const user = await User.findOne({ email }).select("+password");

    // 3. Verify security match thresholds
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({
        message: "Invalid credentials"
      });
    }

  } catch (error) {
    console.error("Login Server Error:", error);
    res.status(500).json({ 
      message: "Server encountered an error processing your login request.", 
      error: error.message 
    });
  }
};

module.exports = {
  registerUser,
  loginUser
};