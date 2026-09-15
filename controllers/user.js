const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { setUser } = require("../services/auth");

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 24 * 60 * 60 * 1000,
};

async function handleUserSignup(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).render("signup", { error: "All fields are required" });
  }

  try {
    const user = await User.create({
      name,
      email,
      password,
    });
    const token = setUser(user);
    res.cookie("uid", token, COOKIE_OPTIONS);
    return res.redirect("/");
  } catch (error) {
    console.error("Signup Error:", error);
    if (error.code === 11000) {
      return res.render("signup", { error: "Email already exists" });
    }
    return res.status(500).render("signup", { error: "Failed to create account. Please try again." });
  }
}

async function handleUserLogin(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).render("login", { error: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).render("login", {
        error: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).render("login", {
        error: "Invalid email or password",
      });
    }

    const token = setUser(user);
    res.cookie("uid", token, COOKIE_OPTIONS);
    return res.redirect("/");
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).render("login", {
      error: "Internal server error. Please try again later.",
    });
  }
}

async function handleUserLogout(req, res) {
  res.clearCookie("uid", COOKIE_OPTIONS);
  return res.redirect("/");
}

module.exports = { handleUserSignup, handleUserLogin, handleUserLogout };