const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' });
}
const generateRefreshToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_REFERESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' });
}

const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
}
const verifyRefreshToken = (refreshToken) => {
    return jwt.verify(refreshToken, process.env.JWT_REFERESH_SECRET);
}

module.exports = {
    generateToken,
    generateRefreshToken,
    verifyToken,
    verifyRefreshToken
};