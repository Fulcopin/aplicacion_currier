const express = require('express');
const router_users = express.Router();
const bcrypt = require('bcryptjs');
const db= require('./conecction')
const dotenv = require('dotenv');
const axios= require('axios');
dotenv.config();
const authenticateToken=require('../Middleware/User_auth');
const cors = require('cors');
router_users.use(authenticateToken);
router_users.post('/RegistrarProducto', async (req, res) => {
    let nombre = req.body.nombre;
    let descripcion = req.body.descripcion;
    let peso = req.body.peso;
    let precio = req.body.precio;
    let cantidad = req.body.cantidad;
    let link = req.body.link;
    let imagenUrl = req.body.imagenUrl;  // URL from Cloudinary
    let facturaUrl = req.body.facturaUrl; // URL from Cloudinary

    try {
        const produref = await db.collection('Productos').add({
            Id_user: req.user.id,
            Nombre: nombre,
            Descripcion: descripcion,
            Peso: peso,
            Precio: precio,
            Cantidad: cantidad,
            Link: link,
            ImagenUrl: imagenUrl,
            FacturaUrl: facturaUrl,
            FechaCreacion: new Date()
        });

        return res.status(200).json({
            message: "Producto agregado exitosamente",
            id: produref.id,
            imagenUrl,
            facturaUrl
        });
    } catch (error) {
        return res.status(400).json({
            message: "Error al registrar producto",
            error: error.message
        });
    }
});
/* Obtener todos los productos */
router_users.get('/productos', async (req, res) => {
    try {
        // Fix collection name and operator
        const productosSnapshot = await db.collection("Productos")
            .where("Id_user", "==", req.user.id)
            .get();

        if (productosSnapshot.empty) {
            return res.status(200).json([]);
        }

        const productosList = productosSnapshot.docs.map(doc => ({
            id: doc.id,
            nombre: doc.data().Nombre,
            descripcion: doc.data().Descripcion,
            peso: doc.data().Peso,
            precio: doc.data().Precio,
            cantidad: doc.data().Cantidad,
            link: doc.data().Link,
            imagenUrl: doc.data().ImagenUrl,
            facturaUrl: doc.data().FacturaUrl,
            fechaCreacion: doc.data().FechaCreacion?.toDate()
        }));

        return res.status(200).json(productosList);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        return res.status(500).json({ 
            message: "Error al obtener productos", 
            error: error.message 
        });
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
router_users.get('/MostrarEnvio', async(req,res)=>{
    try{
    const Envios=await db.collection("Envios").where("Id_user", "==", req.user.id).get();
    const enviosList = enviosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.status(200).json(enviosList);
    }catch(err){
        return res.status(500).json({message:"Error al obtener",error: err.message})
    }
})

router_users.post('/GenerarPago',async (req,res)=>{
    let Currency="USD";
    let ClientTransactionID=req.body.ClientTransactionID
    let amountWithTax=req.body.subtotal;
    let Calculo_tax=(amountWithTax*0.15);
    let tax=parseFloat(Calculo_tax.toFixed(2));
    let amount=amountWithTax+tax
    let reference="Pago con tarjeta";
    let storeId="8928b5ff-a715-4ae8-a51d-cefa8b3cb1e9";
    const data= {
    clientTransactionId: ClientTransactionID,
    storeId: storeId,
    reference:reference,
    currency:Currency,
    amount: amount*100,
    amountWithTax:amountWithTax*100,
    tax:tax*100
    }
    try{ 
        const token=process.env.TOKEN;
        const response=await axios.post("https://pay.payphonetodoesposible.com/api/Links",data,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        
    );
        const { status, data: responseData } = response;
        res.status(status).json({
            message: "Pago generado exitosamente",
            response: responseData
        })
       
    }catch(err){
        const status = err.response?.status || 500;
        const message = err.response?.data?.errors || "Error al generar el pago";

        res.status(status).json({
            message: "Error al generar el pago",
            error: message
        });
       
    }



})
module.exports=router_users;
