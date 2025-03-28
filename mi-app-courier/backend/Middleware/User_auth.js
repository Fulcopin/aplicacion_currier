const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

function authenticateToken(req, res, next) {
    const token= req.headers['authorization'];
    if (token == null) return res.status(401).json({message:"Token no proporcionado"}); 
    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({message:"Token invalido en usuarios"}); 
        req.user = user;
        next();
    });
}

module.exports = authenticateToken;