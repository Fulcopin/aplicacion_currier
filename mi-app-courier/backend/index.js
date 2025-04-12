const express = require('express');
const jwt= require("jsonwebtoken");
const dotenv = require('dotenv');
const db= require("./routes/conecction");
const  bcrypt= require("bcryptjs")
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const adminRouter=require('./routes/admin');
const UserRoutes=require('./routes/User')
const cors = require('cors');
app.use(express.json());
app.use(cors());
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
        return { isValid: false, rol: null , id:null,direccion:null,ciudad:null,pais:null};
    } else {
        const userdata = user.docs[0].data();
        const isValidPassword = await bcrypt.compare(password, userdata.Contraseña);
        if (isValidPassword) {
            return { isValid: true, rol: userdata.Rol, id:user.docs[0].id,direccion:userdata.Direccion,ciudad:userdata.Ciudad,pais:userdata.Pais};
        } else {
            return { isValid: false, rol: null, id:null,direccion:null,ciudad:null,pais:null};
        }
    }
}
/*Login */
// Corrected backend code
app.post("/Login", async function (req,res){
    let user = req.body.email;
    let password = req.body.password;
    
    if(!user || !password){
      return res.status(401).json({message:"Datos no proporcionados"})
    }
    
    // Change 'valid' to 'isValid' to match your function
    const {isValid, rol, id,direccion,ciudad,pais} = await Verifricar_usuario(user, password)
    
    // Change 'valid' to 'isValid' here too
    if (!isValid) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }
    
    if(rol === "CLIENTE"){
      const token = jwt.sign({id: id}, process.env.SECRET_KEY, {expiresIn:'1h'});
      return res.status(200).json({
        message: "Login de cliente exitoso",
        token: token,
        id: id,
        direccion:direccion,
        ciudad:ciudad,
        pais:pais,
      });
    } else if(rol === "ADMIN"){
      const token = jwt.sign({id: id}, process.env.SECRET_KEY_admin, {expiresIn:'1h'});
      return res.status(200).json({
        message: "Login Exitoso", 
        token: token,
        id: id
      });
    } else {
      return res.status(401).json({message: "Usuario no encontrado"});
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
        Rol:"ADMIN"
    })
    return res.status(201).json({ message: "Usuario registrado" , UserId:userref.id});
 }catch(error){
    return res.status(400).json({error: error.message})
 }
    
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// ...existing code...
// Add after existing routes
app.get("/validate", async function(req, res) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({message: "Token no proporcionado"});
    }
    
    try {
        let decoded;
        try {
            // First try client token
            decoded = jwt.verify(token, process.env.SECRET_KEY);
        } catch {
            // If client token fails, try admin token
            decoded = jwt.verify(token, process.env.SECRET_KEY_admin);
        }

        const userDoc = await db.collection("Usuarios").doc(decoded.id).get();
        
        if (!userDoc.exists) {
            return res.status(401).json({message: "Usuario no encontrado"});
        }
        
        const userData = userDoc.data();
        return res.status(200).json({
            id: userDoc.id,
            nombre: userData.Nombre,
            apellido: userData.Apellido,
            email: userData.Email,
            direccion: userData.Direccion,
            telefono: userData.Telefono,
            ciudad: userData.Ciudad,
            pais: userData.Pais,
            rol: userData.Rol
        });
    } catch (err) {
        console.error('Token validation error:', err);
        return res.status(403).json({message: "Token inválido"});
    }
});
/* Get All Users */
app.get("/users", async function(req, res) {
    try {
      const usersRef = db.collection("Usuarios");
      const snapshot = await usersRef.get();
      
      if (snapshot.empty) {
        return res.status(404).json({ message: "No se encontraron usuarios" });
      }
  
      const users = [];
      snapshot.forEach(doc => {
        const userData = doc.data();
        users.push({
          id: doc.id,
          nombre: userData.Nombre,
          apellido: userData.Apellido,
          email: userData.Email,
          direccion: userData.Direccion,
          telefono: userData.Telefono,
          ciudad: userData.Ciudad,
          pais: userData.Pais,
          rol: userData.Rol
        });
      });
  
      return res.status(200).json(users);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      return res.status(500).json({ 
        message: "Error al obtener usuarios", 
        error: error.message 
      });
    }
  });
  
 