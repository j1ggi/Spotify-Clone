const User = require("../models/user.model");
const Song = require("../models/song.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 1. User Registration
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validation: All fields must be present
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields (name, email, password) are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Comprehensive RFC-compliant email validation
        // Accepts all valid standard email formats (letters, numbers, dots, plus, subdomains, etc.)
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({
                message: "Please enter a valid email address (e.g. user@example.com)"
            });
        }

        // Password length validation
        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters long"
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(409).json({
                message: "Email already registered. Please login instead."
            });
        }

        // Hash password with bcryptjs (10 salt rounds)
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user with normalized email
        const newUser = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: role === "admin" ? "admin" : "user"
        });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (err) {
        res.status(500).json({
            message: "Registration failed: " + err.message
        });
    }
};

// 2. User Login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Find user by normalized email
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Generate JWT token (expires in 7 days)
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({
            message: "Login error: " + err.message
        });
    }
};

// 3. Get Current User Profile
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "User profile fetched",
            user
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

// 4. Like a Song
const likeSong = async (req, res) => {
    try {
        const { songId } = req.params;

        // Verify song exists
        const song = await Song.findById(songId);
        if (!song) {
            return res.status(404).json({
                message: "Song not found"
            });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Prevent duplicate likes
        const alreadyLiked = user.likedSongs.some(
            (id) => id.toString() === songId
        );

        if (alreadyLiked) {
            return res.status(400).json({
                message: "Song is already in your liked songs",
                likedSongs: user.likedSongs
            });
        }

        user.likedSongs.push(songId);
        await user.save();

        res.status(200).json({
            message: "Song liked successfully",
            likedSongs: user.likedSongs
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

// 5. Unlike a Song
const unlikeSong = async (req, res) => {
    try {
        const { songId } = req.params;

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        user.likedSongs = user.likedSongs.filter(
            (id) => id.toString() !== songId
        );

        await user.save();

        res.status(200).json({
            message: "Song unliked successfully",
            likedSongs: user.likedSongs
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

// 6. Fetch Logged-in User's Liked Songs
const getLikedSongs = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate("likedSongs");
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "Liked songs fetched successfully",
            likedSongs: user.likedSongs || []
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

module.exports = {
    register,
    login,
    getMe,
    likeSong,
    unlikeSong,
    getLikedSongs
};
