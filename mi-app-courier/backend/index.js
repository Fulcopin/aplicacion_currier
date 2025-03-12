const express = require('express');
const jwt= require("jsonwebtoken");
const dotenv = require('dotenv');
const db= require("../backend/routes/conecction");
const  bcrypt= require("bcryptjs")
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const adminRouter=require('./routes/admin');
const UserRoutes=require('./routes/User')
app.use(express.json());
/*Controlar Endpoints de usuario */
app.use('/user',UserRoutes);
/** Controlar Endpoints de administrador*/
app.use('/admin',adminRouter);
/*Verificar_usuario*/
async function verificar_datos(email) {
    const user=await db.collection("Usuarios").where("email","==",email).get();
    if (user.empty) {
        return false //el suaurio no existe
    } else {
        return true; //el suario existe
    }
}
async function Verifricar_usuario(email, password) {
    const user = await db.collection("Usuarios").where("Email", "==", email).get();
    if (user.empty) {
        return { isValid: false, rol: null , id:null};
    } else {
        const userdata = user.docs[0].data();
        const isValidPassword = await bcrypt.compare(password, userdata.Contraseña);
        if (isValidPassword) {
            return { isValid: true, rol: userdata.Rol, id:user.docs[0].id};
        } else {
            return { isValid: false, rol: null, id:null};
        }
    }
}
/*Login */
app.post("/Login", async function (req,res){
let user=req.body.email;
let password= req.body.password;
if(!user || !password){
   return res.status(401).json({message:"Datos no proporcionados"})
}
const {valid,rol,id}= await Verifricar_usuario(user,password)
if (valid) {
    return res.status(401).json({ message: "Credenciales incorrectas" });
}
if(rol==="CLIENTE"){
    const token=jwt.sign({id:id},process.env.SECRET_KEY,{expiresIn:'1h'});
   return res.status(200).json({message:"Login de cliente exitoso",token: token});
}else{
    if(rol==="ADMIN"){
    const token=jwt.sign({username:user},process.env.SECRET_KEY_admin,{expiresIn:'1h'});
   return res.status(200).json({message:"Login Exitoso",token: token});
    }else{
        return res.status(401).json({message:"Usuario no encotrado"}) ; 
    }
}

}
);
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
    if(await verificar_datos(email)){
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

