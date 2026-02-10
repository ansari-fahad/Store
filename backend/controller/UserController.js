const User = require('../model/user');


exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }
    const user = await User.create({
      username,
      password
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user._id, username: user.username }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.json({
      message: 'Login successful',
      user: { id: user._id, username: user.username }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
