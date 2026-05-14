const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'your-very-secure-secret';

function setUser(user) {
  return jwt.sign(
    {
      _id: user._id,
      email: user.email,
      name: user.name,
    },
    secret,
    { expiresIn: '24h' }
  );
}

function getUser(token) {
  if (!token) return null;

  try {
    return jwt.verify(token, secret);
  } catch (err) {
    return null;
  }
}

module.exports = { setUser, getUser };
