import User from "../models/User.js";
import jwt from "jsonwebtoken";

export async function signup(req, res) {
  const { email, password, fullName } = req.body;
  try {
// Basic validation
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6)
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
// Check if the email is already in use
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }
// Generate a random avatar URL
    const idx = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;
// Create and save the new user
    const newUser = await User.create({ email, password, fullName, profilePic: randomAvatar });

    // Generate JWT token
    const token = jwt.sign({userId: newUser._id}, process.env.JWT_SECRET_KEY, {expiresIn: '7d'});
// Set the token in an HTTP-only cookie
    res.cookie('jwt', token, {
      maxAge: 7*24*60*60*1000,
      httpOnly: true, // secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    })
// Send response
    res.status(201).json({success: true, user: newUser})
  } catch (err) {
    console.error("Signup contoller error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function login(req, res) {
  res.send("Login Route");
}
export function logout(req, res) {
  res.send("Logout Route");
}
