const express = require('express');
const router_users = express.Router();
const bcrypt = require('bcryptjs');
const db= require('./conecction')
const dotenv = require('dotenv');
dotenv.config();
const authenticateToken=require('../Middleware/User_auth');
router_users.use(authenticateToken);

router_users.post('/RegistrarProducto',async (req,ser)=>{
    let nombre= req.body.nombre;
    let descripccion=req.body.descripccion;
    let peso=req.body.descripccion;
    let precio=req.body.precio;
    let cantidad=req.body.cantidad;
    let link=req.body.link;
    try{
    const produref= await db.collection(Porducto).add({
        Id_user: req.user.id,
        Nombre:nombre,
        Descripccion: descripccion,
        Peso: peso,
        Precio: precio,
        Cantidad: cantidad,
        Link: link

    })
    return res.status(200).json({message: "producto agregado", Id: produref.id})
}catch(error){
    return res.status(400).json({ message: "Error al registrar producto", error: error.message });
}
    
});
/* Obtener todos los productos */
router_users.get('/productos', async (req, res) => {
    try {
        const productosSnapshot = await db.collection("Producto").where("Id_user","===",req.user.Id).get();
        const productosList = productosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return res.status(200).json(productosList);
    } catch (error) {
        return res.status(500).json({ message: "Error al obtener productos", error: error.message });
    }
});
/* Obtener un producto por ID */
router_users.get('/producto/:id', async (req, res) => {
    const productoId = req.params.id;
    try {
        const productoDoc = await db.collection("Producto").doc(productoId).get();
        if (!productoDoc.exists) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }
        return res.status(200).json({ id: productoDoc.id, ...productoDoc.data() });
    } catch (error) {
        return res.status(500).json({ message: "Error al obtener producto", error: error.message });
    }
});
/* Eliminar un producto */
router_users.delete('/producto/:id', async (req, res) => {
    const productoId = req.params.id;
    const userID= req.user.Id;

    try {
        const productoDoc = await db.collection("Producto").doc(productoId).get();
        if (!productoDoc.exists) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        await db.collection("Producto").doc(productoId).delete();
        return res.status(200).json({ message: "Producto eliminado" });
    } catch (error) {
        return res.status(500).json({ message: "Error al eliminar producto", error: error.message });
    }
}); 
/*Registrar Pago */
router_users.post('/RegistrarPago', async (req, res) => {
    let monto = req.body.monto;
    let metodo = req.body.metodo;
    try {
        const pagoRef = await db.collection("Pagos").add({
            Id_user: req.user.id,
            Monto: monto,
            Metodo: metodo,
            Fecha: new Date()
        });
        return res.status(200).json({ message: "Pago registrado", Id: pagoRef.id });
    } catch (error) {
        return res.status(400).json({ message: "Error al registrar pago", error: error.message });
    }
});
router_users.post('/RegistrarEnvio',async(req, res)=>{
   
    let direccion = req.body.direccion;
    let pagoId = req.body.pagoId; // ID del pago registrado

    try {
        // Verificar que el pago exista
        const pagoDoc = await db.collection("Pagos").doc(pagoId).get();
        if (!pagoDoc.exists) {
            return res.status(404).json({ message: "Pago no encontrado" });
        }
        // Obtener todos los productos del usuario
        const productosSnapshot = await db.collection("Producto").where("Id_user", "==", req.user.id).get();
        const productosList = productosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Crear el envío
        const envioRef = await db.collection("Envios").add({
            Id_user: req.user.id,
            Direccion: direccion,
            Productos: productosList,
            PagoId: pagoId,
            Fecha: new Date()
        });

        return res.status(200).json({ message: "Envío creado", Id: envioRef.id });
    } catch (error) {
        return res.status(400).json({ message: "Error al crear envío", error: error.message });
    }
 
})



module.exports=router_users;
