import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { upsertStreamUser } from "../lib/stream.js";

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
    const newUser = await User.create({
      email,
      password,
      fullName,
      profilePic: randomAvatar,
    });

    try {
      await upsertStreamUser({
        id: newUser._id.toString(),
        name: newUser.fullName,
        image: newUser.profilePic || "",
      });
      console.log(
        `Stream user created successfully for ${newUser.fullName}`
      );
    } catch (err) {
      console.log("Error in creating/updating Stream user:", err);
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );
    // Set the token in an HTTP-only cookie
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true, // secure: process.env.NODE_ENV === 'production',
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
    // Send response
    res.status(201).json({ success: true, user: newUser });
  } catch (err) {
    console.error("Signup contoller error:", err);
    res.status(500).json({ message: "Server error" });
  }
}
export async function login(req, res) {
  try {
    // Basic validation
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });
    // Check if the password is correct
    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Invalid email or password" });
    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });
    // Set the token in an HTTP-only cookie
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true, // secure: process.env.NODE_ENV === 'production',
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
    // Send response
    res.status(200).json({ success: true, user });
  } catch (err) {
    console.log("Error in login controller:", err);
    res.status(500).json({ message: "Server error" });
  }
}
export function logout(req, res) {
  res.clearCookie("jwt");
  res.status(200).json({ success: true, message: "Logout successfully" });
}
export async function onboard(req, res) {
  try {
    const userId = req.user._id;
    const { fullName, bio, nativeLanguage, learningLanguage, location } =
      req.body;
    if (!fullName || !nativeLanguage || !learningLanguage || !location) {
      return res.status(400).json({
        message: "All fields are required",
        missingFields: [
          !fullName && "fullName",
          !bio && "bio",
          !nativeLanguage && "nativeLanguage",
          !learningLanguage && "learningLanguage",
          !location && "location",
        ].filter(Boolean),
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...req.body,
        inOnboarded: true,
      },
      { new: true }
    );
    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    try {
      await upsertStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.fullName,
        image: updatedUser.profilePic || "",
      });
      console.log(
        `Stream user updated successfully for ${updatedUser.fullName}`
      );
    } catch (err) {
      console.log("Error in updated Stream user:", err);
    }

    res.status(200).json({ success: true, user: updatedUser });
  
  } catch (err) {
    console.error("Error in onboard controller:", err);
    res.status(500).json({ message: "Server error" });
  }
}
