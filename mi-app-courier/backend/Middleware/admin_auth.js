const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    if (token == null) return res.Status(401).json({message:"Token no proporcionado"}); 
    jwt.verify(token, process.env.SECRET_KEY_admin, (err, user) => {
        if (err) return res.Status(403).json({message:"Token invalido"}); 
        req.user = user;
        next();
    });
}

module.exports = authenticateToken;