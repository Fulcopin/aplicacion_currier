const express = require('express');
const jwt= require("jsonwebtoken");
const dotenv = require('dotenv');
const db= require("../backend/routes/conecction");
const  bcrypt= require("bcryptjs")
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
/*Verificar_usuario*/
async function verificar_datos(email) {
    const user=await db.collection("Usuarios").where("email","==",email).get();
    if (user.empty) {
        return true;
    } else {
        return false;
    }
}
async function Verifricar_usuario(email,password) {
    const user =await db.collection("Usuarios").where("email","==",email).get();
    if (user.empty) {
        return false;
    } else {
        const userdata = user.docs[0].data();
        const isValidPassword = await bcrypt.compare(password, userdata.Contraseña);
        return isValidPassword;
    }
    
}
/*Login */
app.post("/Login", async function (req,res){
let user=req.body.email;
let password= req.body.password;
if(!user || !password){
    res.status(401).json({message:"Datos no propocrionados"})
}
if(Verifricar_usuario(user,password)){
    const token=jwt.sign({username:user},process.env.SECRET_KEY,{expiresIn:'1h'});
    res.status(200).json({message:"Login Exitoso",token: token});
}
});
/*Resgister*/
app.post("/register",async function (req,res) {
    let Nombre=req.body.nombre;
    let apellido=req.body.apellido;
    let email=req.body.email;
    let contraseña=req.body.contraseña;
    let Direcccion= req.body.Direccion;
    let Telefono = req.body.Telefono;
    let ciudad=req.body.ciudad;
    let Pais= req.body.Pais;
    if (!Nombre || !apellido || !email || !contraseña || !Direcccion || !Telefono || !ciudad || !Pais ) {
        return res.status(400).json({ message: "Datos no proporcionados" });
    }
    if(verificar_datos(email)!=false){
        return res.status(400).json({ message: "Datos ya existentes" });
    }
    const hashinPass= await bcrypt.hash(contraseña,10);
    try{
    const userref=await db.collection("Usuarios").add({
        Nombre:Nombre,
        Apellido:apellido,
        Email: email,
        Contraseña: hashinPass,
        Direccion: Direcccion,
        Telefono: Telefono,
        Ciudad: ciudad,
        Pais: Pais,
        Rol:"CLIENTE"
    })
    return res.status(201).json({ message: "Usuario registrado" , UserId:userref.id});
 }catch(error){
    return res.status(400).json({error: error.message})
 }
    
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});