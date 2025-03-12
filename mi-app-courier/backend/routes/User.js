const express = require('express');
const router_users = express.Router();
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();
const authenticateToken=require('../Middleware/User_auth');
router_users.use(authenticateToken);

router_users.get('/', async function (req,res) {
    return res.status(200).json({ userId: req.user.id });
    
})
router_users.post('/RegistrarProducto',async (req,ser)=>{
    let nombre= req.body.nombre;
    let descripccion=req.body.descripccion;
    




})

module.exports=router_users;