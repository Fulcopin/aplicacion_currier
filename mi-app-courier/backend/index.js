const express = require('express');
const jwt= require("jsonwebtoken");
const dotenv = require('dotenv');
const db= require("../backend/routes/conecction");
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
/*Verificar_usuario*/
async function verificar_datos(username,password) {
    const user=await db.collection("Usuarios").where("Username","==",username).where("password","==",password).get();
    return user!=null
}
/*Login */
app.post("/Login", async function (req,res){
let user=req.body.username;
let password= req.body.password;
if(!user || !password){
    res.status(401).json({message:"Datos no propocrionados"})
}
if(verificar_datos(user,password)){
    const token=jwt.sign({username:user},process.env.SECRET_KEY,{expiresIn:'1h'});
    res.status(200).json({message:"Login Exitoso",token: token});
}


}
)
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});