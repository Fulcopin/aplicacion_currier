const express = require('express');
const router_admin = express.Router();
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const db = require('./conecction');
const router_users = require('./User');
const Middleware=require('../Middleware/admin_auth');

dotenv.config();
router_users.use(Middleware)

router_admin.post('/RegistrarAlmacen',async (req,res)=>{

let ubicacion= req.body.ubicacion;
let capacidad= req.body.capcidad;
let responsable= req.body.responsable;
try{
const alamceref= await db.collection("Almacen").add({
    Ubicacion: ubicacion,
    Capacidad: capacidad,
    Responsable: responsable,
    Articulos: []

})
return res.status(200).json({message:"Ubicacion registrada",Id: alamceref.id})
}catch(err){
    return res.status(401).json({message:"Ubicacion no guardada",Id: null})
}
})
/* Mostrar todos los almacenes */
router_admin.get('/almacenes', async (req, res) => {
    try {
        const almacenesSnapshot = await db.collection("Almacen").get();
        const almacenesList = almacenesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return res.status(200).json(almacenesList);
    } catch (error) {
        return res.status(500).json({ message: "Error al obtener almacenes", error: error.message });
    }
});
router_admin.get('/envios', async (req, res) => {
    try {
        const enviosSnapshot = await db.collection("Envios").get();
        const enviosList = enviosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return res.status(200).json(enviosList);
    } catch (error) {
        return res.status(500).json({ message: "Error al obtener envíos", error: error.message });
    }
});
/* Obtener todos los artículos de un envío específico */
router_admin.get('/envio/:envioId/articulos', async (req, res) => {
    const envioId = req.params.envioId;
    try {
        const articulosSnapshot = await db.collection("Producto").where("EnvioId", "==", envioId).get();
        const articulosList = articulosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return res.status(200).json(articulosList);
    } catch (error) {
        return res.status(500).json({ message: "Error al obtener artículos del envío", error: error.message });
    }
});
/* Asignar un artículo a un almacén */
router_admin.post('/asignarArticulo', async (req, res) => {
    let articuloId = req.body.articuloId;
    let almacenId = req.body.almacenId;

    try {
        const almacenRef = db.collection("Almacen").doc(almacenId);
        const articuloRef = db.collection("Producto").doc(articuloId);

        const almacenDoc = await almacenRef.get();
        if (!almacenDoc.exists) {
            return res.status(404).json({ message: "Almacén no encontrado" });
        }

        const articuloDoc = await articuloRef.get();
        if (!articuloDoc.exists) {
            return res.status(404).json({ message: "Artículo no encontrado" });
        }

        await almacenRef.update({
            Articulos: admin.firestore.FieldValue.arrayUnion(articuloId)
        });

        return res.status(200).json({ message: "Artículo asignado al almacén" });
    } catch (error) {
        return res.status(500).json({ message: "Error al asignar artículo", error: error.message });
    }
});

router_admin.get('/MostrarEnvio', async(req,res)=>{
    try {
        const Envios = await db.collection("Producto").get();
        const ListaEnvios = Envios.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return res.status(200).json(ListaEnvios)
        
    } catch (error) {
        return res.status(500).json({message:"Erroe al consultar los pedidos"})        
    }
    
})
router_admin.get('/MostarUsuarios',async(req,res)=>{
    try {
        const Usuarios = await db.collection("Usuarios").get();
        const ListaUsuarios = Usuarios.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return res.status(200).json(ListaUsuarios)
        
    } catch (error) {
        return res.status(500).json({message:"Erroe al consultar los usuarios"})        
    }
})
module.exports=router_admin;