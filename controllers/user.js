const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { setUser } = require("../service/auth");

async function handleUserSignup(req, res) {
  const { name, email, password } = req.body;
  try {
    const user = await User.create({
      name,
      email,
      password,
    });
    const token = setUser(user);
    res.cookie("uid", token);
    return res.redirect("/");
  } catch (error) {
    if (error.code === 11000) {
      return res.render("signup", { error: "Email already exists" });
    }
    return res.render("signup", { error: "Something went wrong" });
  }
}

async function handleUserLogin(req, res) {
  const { email, password } = req.body;

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
  res.cookie("uid", token);
  return res.redirect("/");
}

async function handleUserLogout(req, res) {
  res.clearCookie("uid");
  return res.redirect("/");
}

module.exports = { handleUserSignup, handleUserLogin, handleUserLogout };