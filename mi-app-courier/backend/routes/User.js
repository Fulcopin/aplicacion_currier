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
    try {
        const produref = await db.collection('Productos').add({
            Id_user: req.user.id,
            Nombre: req.body.nombre,
            Descripcion: req.body.descripcion,
            Peso: Number(req.body.peso),
            Precio: Number(req.body.precio),
            Cantidad: parseInt(req.body.cantidad),
            Link: req.body.link,
            ImagenUrl: req.body.imagenUrl,
            FacturaUrl: req.body.facturaUrl,
            Estado: 'No llegado',
            HistorialEstados: [{
                estado: 'No llegado',
                fecha: new Date(),
                usuario: req.user.id
            }],
            FechaCreacion: new Date()
        });

        return res.status(200).json({
            message: "Producto agregado exitosamente",
            id: produref.id,
            imagenUrl: req.body.imagenUrl,
            facturaUrl: req.body.facturaUrl,
            estado: 'No llegado'
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
            fechaCreacion: doc.data().FechaCreacion?.toDate(),
            estado: doc.data().Estado || 'No llegado',
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
// Código para el backend - endpoint RegistrarPago mejorado
router_users.post('/RegistrarPago', async (req, res) => {
    try {
        const { 
            monto, 
            metodo, 
            productos, 
            transactionId, 
            detalles 
        } = req.body;

        // Validar datos requeridos
        if (!monto || !metodo) {
            return res.status(400).json({ 
                success: false,
                message: "Datos incompletos para registrar el pago" 
            });
        }

        // 1. Registrar el pago en la colección Pagos
        const pagoRef = await db.collection("Pagos").add({
            Id_user: req.user.id,
            Monto: monto,
            Metodo: metodo,
            Productos: productos || [],
            TransactionId: transactionId || '',
            Fecha: new Date(),
            Estado: "Completado",
            // Datos adicionales del pago
            Detalles: detalles || {}
        });

        // 2. Si hay productos, actualizar su estado
        if (productos && productos.length > 0) {
            const batch = db.batch();
            
            // Obtener referencia a cada producto y actualizar su estado
            for (const productoId of productos) {
                const productoRef = db.collection("Productos").doc(productoId);
                batch.update(productoRef, { 
                    Estado: "Pagado",
                    FechaPago: new Date(),
                    IdPago: pagoRef.id
                });
            }
            
            // Ejecutar la actualización en lote
            await batch.commit();
        }

        // 3. Crear registro en la colección Facturas si aplica
        let facturaId = null;
        if (detalles && transactionId) {
            const facturaRef = await db.collection("Facturas").add({
                Id_user: req.user.id,
                Id_pago: pagoRef.id,
                Productos: productos || [],
                Monto: monto,
                Fecha: new Date(),
                DatosTransaccion: {
                    TransactionId: transactionId,
                    MetodoPago: metodo,
                    ...detalles
                }
            });
            facturaId = facturaRef.id;
        }

        return res.status(200).json({ 
            success: true,
            message: "Pago registrado correctamente",
            pagoId: pagoRef.id,
            facturaId: facturaId
        });
    } catch (error) {
        console.error("Error al registrar pago:", error);
        return res.status(400).json({ 
            success: false,
            message: "Error al registrar pago", 
            error: error.message 
        });
    }
});
// Add this endpoint to get user by ID
router_users.get('/usuario/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Check if the requesting user can access this data (either admin or self)
        if (userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "No autorizado para acceder a esta información"
            });
        }
        
        // Get user from Firestore
        const userDoc = await db.collection("Usuarios").doc(userId).get();
        
        if (!userDoc.exists) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            });
        }
        
        const userData = userDoc.data();
        
        // Return user data (excluding password)
        return res.status(200).json({
            success: true,
            data: {
                id: userDoc.id,
                nombre: userData.Nombre,
                apellido: userData.Apellido,
                email: userData.Email,
                direccion: userData.Direccion,
                telefono: userData.Telefono,
                ciudad: userData.Ciudad,
                pais: userData.Pais,
                rol: userData.Rol
            }
        });
    } catch (error) {
        console.error('Error al buscar usuario:', error);
        return res.status(500).json({
            success: false,
            message: "Error al buscar usuario",
            error: error.message
        });
    }
});
// Endpoint para actualizar estado de producto como usuario
router_users.put('/ActualizarEstadoProducto/:id', async (req, res) => {
    try {
        const productoId = req.params.id;
        const nuevoEstado = req.body.estado;
        
        // Validar que el estado es válido
        const estadosValidos = ['No llegado', 'En bodega', 'Pagado'];
        if (!estadosValidos.includes(nuevoEstado)) {
            return res.status(400).json({
                success: false,
                message: "Estado no válido"
            });
        }

        // Obtener el producto
        const productoRef = db.collection('Productos').doc(productoId);
        const doc = await productoRef.get();

        if (!doc.exists) {
            return res.status(404).json({ 
                success: false,
                message: "Producto no encontrado" 
            });
        }

        // Verificar que el producto pertenece al usuario
        const productoData = doc.data();
        if (productoData.Id_user !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "No tienes permiso para modificar este producto"
            });
        }

        // Actualizar el estado
        await productoRef.update({
            Estado: nuevoEstado,
            FechaActualizacion: new Date()
        });

        return res.status(200).json({
            success: true,
            message: "Estado actualizado exitosamente",
            estado: nuevoEstado
        });
    } catch (error) {
        console.error('Error al actualizar estado:', error);
        return res.status(500).json({
            success: false,
            message: "Error al actualizar estado",
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


// Ruta para obtener múltiples productos por sus IDs
router_users.post('/ObtenerProductosPorIds', async (req, res) => {
    try {
        const { ids } = req.body;
        
        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({
                success: false,
                message: "Debe proporcionar un array de IDs de productos"
            });
        }

        // Convertir todos los IDs a strings por seguridad
        const stringIds = ids.map(id => String(id));
        
        // Resto del código sigue igual...
        const productosRefs = stringIds.map(id => db.collection("Productos").doc(id));

        // Obtener todos los documentos en una sola consulta
        const productosSnapshots = await db.getAll(...productosRefs);

        const productosList = await Promise.all(
            productosSnapshots.map(async (docSnap) => {
                if (!docSnap.exists) {
                    return null;
                }

                const productoData = docSnap.data();
                const userDoc = await db.collection("Usuarios")
                    .doc(productoData.Id_user)
                    .get();
                
                const userData = userDoc.exists ? userDoc.data() : null;

                return {
                    id: docSnap.id,
                    nombre: productoData.Nombre,
                    descripcion: productoData.Descripcion,
                    peso: Number(productoData.Peso || 0),
                    precio: Number(productoData.Precio || 0),
                    cantidad: parseInt(productoData.Cantidad || 0),
                    link: productoData.Link || '',
                    imagenUrl: productoData.ImagenUrl || '',
                    facturaUrl: productoData.FacturaUrl || '',
                    fechaCreacion: productoData.FechaCreacion?.toDate()?.toISOString(),
                    estado: productoData.Estado || 'No llegado',
                    usuario: userData ? {
                        id: userDoc.id,
                        nombre: userData.Nombre,
                        apellido: userData.Apellido,
                        email: userData.Email,
                        telefono: userData.Telefono || ''
                    } : null
                };
            })
        );

        // Filtrar productos nulos (IDs no encontrados)
        const productosFiltrados = productosList.filter(p => p !== null);

        return res.status(200).json({
            success: true,
            data: productosFiltrados,
            total: productosFiltrados.length
        });

    } catch (error) {
        console.error('Error al obtener productos por IDs:', error);
        return res.status(500).json({
            success: false,
            message: "Error al obtener productos",
            error: error.message
        });
    }
});
router_users.post('/RegistrarEnvio', async(req, res) => {
   
    let direccion = req.body.direccion;
    let pagoId = req.body.pagoId;
    let origen = req.body.origen || "Miami, FL";
    let fechaEstimada = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días después
    let productos=req.body.productos || [];
    try {
        // Verificar que el pago exista
        const pagoDoc = await db.collection("Pagos").doc(pagoId).get();
        if (!pagoDoc.exists) {
            return res.status(404).json({ message: "Pago no encontrado" });
        }
        
        // Obtener todos los productos del usuario
       // const productosSnapshot = await db.collection("Producto").where("Id_user", "==", req.user.id).get();
        //const productosList = productosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Generar tracking number único
        const trackingNumber = `VB-${Date.now().toString().substring(5)}${Math.floor(Math.random() * 1000)}`;
        
        // Crear el envío con más información
        const envioRef = await db.collection("Envios").add({
            Id_user: req.user.id,
            Direccion: direccion,
            Origen: origen,
            TrackingNumber: trackingNumber,
            Estado: "Procesando", // Estado inicial
            Productos: productos,
            PagoId: pagoId,
            Fecha: new Date(),
            FechaEstimada: fechaEstimada,
            Eventos: [
                {
                    fecha: new Date(),
                    ubicacion: origen,
                    descripcion: "Paquete registrado en el sistema",
                    estado: "enBodega"
                }
            ]
        });

        // Devolver más información en la respuesta para el cliente
        return res.status(200).json({ 
            message: "Envío creado", 
            id: envioRef.id,
            trackingNumber: trackingNumber,
            fecha: new Date(),
            estado: "Procesando",
            fechaEstimada: fechaEstimada
        });
    } catch (error) {
        console.error("Error al crear envío:", error);
        return res.status(400).json({ message: "Error al crear envío", error: error.message });
    }
});

// MEJORA DEL ENDPOINT MOSTRAR ENVÍOS
router_users.get('/MisEnvios', async(req, res) => {
    try {
        const enviosSnapshot = await db.collection("Envios").where("Id_user", "==", req.user.id).get();
        
        if (enviosSnapshot.empty) {
            return res.status(200).json([]);
        }
        
        const enviosList = enviosSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                trackingNumber: data.TrackingNumber,
                fecha: data.Fecha.toDate(),
                estado: data.Estado,
                origen: data.Origen,
                direccion: data.Direccion,
                productos: data.Productos,
                fechaEstimada: data.FechaEstimada ? data.FechaEstimada : null,
                eventos: data.Eventos || []
            };
        });
        
        return res.status(200).json(enviosList);
    } catch (error) {
        console.error("Error al obtener envíos:", error);
        return res.status(500).json({ message: "Error al obtener envíos", error: error.message });
    }
});
router_users.get('/MostrarEnvio', async(req,res)=>{
    try{
    const Envios=await db.collection("Envios").where("Id_user", "==", req.user.id).get();
    const enviosList = enviosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.status(200).json(enviosList);
    }catch(err){
        return res.status(500).json({message:"Error al obtener",error: err.message})
    }
})


// Get shipment details by ID
router_users.get('/shipments/:id', async (req, res) => {
  try {
    const shipmentId = req.params.id;
    const shipmentDoc = await db.collection('shipments').doc(shipmentId).get();
    
    if (!shipmentDoc.exists) {
      return res.status(404).json({ message: 'Envío no encontrado' });
    }
    
    const shipmentData = shipmentDoc.data();
    
    // Format the response to match what the frontend expects
    return res.status(200).json({
      id: shipmentDoc.id,
      trackingNumber: shipmentData.TrackingNumber,
      status: shipmentData.Estado,
      origin: shipmentData.Origen,
      destination: shipmentData.Direccion,
      date: shipmentData.Fecha ? shipmentData.Fecha.toDate() : null,
      estimatedDelivery: shipmentData.FechaEstimada ? shipmentData.FechaEstimada.toDate() : null,
      trackingHistory: shipmentData.Eventos || [],
      productsList: shipmentData.Productos || []
    });
  } catch (error) {
    console.error('Error getting shipment details:', error);
    return res.status(500).json({ message: 'Error al obtener los detalles del envío' });
  }
});

// Update shipment status
router_users.put('/shipments/:id/status', async (req, res) => {
  try {
    const shipmentId = req.params.id;
    const { status, description, location } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'El estado es requerido' });
    }
    
    const shipmentRef = db.collection('shipments').doc(shipmentId);
    const shipmentDoc = await shipmentRef.get();
    
    if (!shipmentDoc.exists) {
      return res.status(404).json({ message: 'Envío no encontrado' });
    }
    
    // Create new event for tracking history
    const newEvent = {
      estado: status,
      descripcion: description || `Estado actualizado a: ${status}`,
      fecha: new Date(),
      ubicacion: location || 'No especificada'
    };
    
    // Get current data
    const shipmentData = shipmentDoc.data();
    const eventos = shipmentData.Eventos || [];
    
    // Update the shipment
    await shipmentRef.update({
      Estado: status,
      Eventos: [...eventos, newEvent]
    });
    
    return res.status(200).json({
      message: 'Estado actualizado correctamente',
      currentStatus: status,
      events: [...eventos, newEvent]
    });
  } catch (error) {
    console.error('Error updating shipment status:', error);
    return res.status(500).json({ message: 'Error al actualizar el estado del envío' });
  }
});


router_users.post('/GenerarPago', async (req, res) => {
    let Currency = "USD";
    let ClientTransactionID = req.body.ClientTransactionID;
    
    
    let amountWithTax = Math.round(parseFloat(req.body.subtotal) * 100) / 100;
    
    
    let Calculo_tax = Math.round(amountWithTax * 0.15 * 100) / 100;
    let tax = Calculo_tax;
    let amount = Math.round((amountWithTax + tax) * 100) / 100;
    
    let reference = "Pago con tarjeta";
    let storeId = "8928b5ff-a715-4ae8-a51d-cefa8b3cb1e9";
    
    // Multiplicar por 100 y convertir a entero para enviar como centavos
    const data = {
        clientTransactionId: ClientTransactionID,
        storeId: storeId,
        reference: reference,
        currency: Currency,
        amount: Math.round(amount * 100),
        amountWithTax: Math.round(amountWithTax * 100),
        tax: Math.round(tax * 100)
    }
    
    try {
        const token = process.env.TOKEN;
        console.log('Enviando solicitud a PayPhone con datos:', JSON.stringify(data));
        
        const response = await axios.post("https://pay.payphonetodoesposible.com/api/Links", data,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        const { status, data: responseData } = response;
        console.log('Respuesta exitosa de PayPhone:', status, JSON.stringify(responseData));
        
        res.status(status).json({
            success: true,
            message: "Pago generado exitosamente",
            response: responseData
        });
       
    } catch (err) {
        console.error('Error completo en GenerarPago:', err);
        
        // Extract detailed error information
        const errorResponse = {
            success: false,
            message: "Error al generar el pago",
            error: {
                status: err.response?.status || 500,
                statusText: err.response?.statusText || 'Error desconocido',
                data: err.response?.data || {},
                errors: err.response?.data?.errors || [],
                message: err.message || 'Error en la comunicación con el servicio de pagos'
            },
            request: {
                url: err.config?.url || 'URL desconocida',
                method: err.config?.method || 'Método desconocido',
                headers: err.config?.headers || {},
                data: data
            }
        };
        
        console.error('Detalle del error:', JSON.stringify(errorResponse));
        
        res.status(errorResponse.error.status).json(errorResponse);
    }
});

module.exports = router_users;

