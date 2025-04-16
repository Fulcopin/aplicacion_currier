const express = require('express');
const router_admin = express.Router();
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const db = require('./conecction');
const router_users = require('./User');
const Middleware=require('../Middleware/admin_auth');
// At the top of your file, add this import:
const admin = require('firebase-admin');

// Then in your code, keep using serverTimestamp:

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
router_admin.get('/MostrarProductos', async (req, res) => {
    try {
        const productosSnapshot = await db.collection("Productos")
            .orderBy("FechaCreacion", "desc")
            .get();

        const productosList = [];

        for (const doc of productosSnapshot.docs) {
            const productoData = doc.data();
            const userDoc = await db.collection("Usuarios")
                .doc(productoData.Id_user)
                .get();
            
            const userData = userDoc.exists ? userDoc.data() : null;

            productosList.push({
                id: doc.id,
                nombre: productoData.Nombre,
                descripcion: productoData.Descripcion,
                peso: Number(productoData.Peso), // Convert to number
                precio: Number(productoData.Precio), // Convert to number
                cantidad: parseInt(productoData.Cantidad), // Convert to integer
                link: productoData.Link,
                imagenUrl: productoData.ImagenUrl,
                facturaUrl: productoData.FacturaUrl,
                fechaCreacion: productoData.FechaCreacion?.toDate(),
                estado: productoData.Estado ,
                
                usuario: userData ? {
                    id: userDoc.id,
                    nombre: userData.Nombre,
                    apellido: userData.Apellido,
                    email: userData.Email,
                    telefono: userData.Telefono
                } : null
            });
        }

        return res.status(200).json({
            success: true,
            data: productosList,
            total: productosList.length
        });

    } catch (error) {
        console.error('Error al obtener productos:', error);
        return res.status(500).json({
            success: false,
            message: "Error al obtener productos",
            error: error.message
        });
    }
});
// Endpoint para obtener productos en bodega// Endpoint para obtener productos en bodega
router_admin.get('/productos/en-bodega', async (req, res) => {
    try {
        // Option 1: Try with composite query (requires index)
        try {
            const productosSnapshot = await db.collection("Productos")
                .where("Estado", "==", "En bodega")
                .orderBy("FechaCreacion", "desc")
                .get();

            const productosList = [];

            for (const doc of productosSnapshot.docs) {
                const productoData = doc.data();
                const userDoc = await db.collection("Usuarios")
                    .doc(productoData.Id_user)
                    .get();
                
                const userData = userDoc.exists ? userDoc.data() : null;

                productosList.push({
                    id: doc.id,
                    nombre: productoData.Nombre,
                    descripcion: productoData.Descripcion,
                    peso: Number(productoData.Peso),
                    precio: Number(productoData.Precio),
                    cantidad: parseInt(productoData.Cantidad),
                    link: productoData.Link,
                    imagenUrl: productoData.ImagenUrl,
                    facturaUrl: productoData.FacturaUrl,
                    fechaCreacion: productoData.FechaCreacion?.toDate(),
                    fechaActualizacion: productoData.FechaActualizacion?.toDate(),
                    estado: productoData.Estado,
                    usuario: userData ? {
                        id: userDoc.id,
                        nombre: userData.Nombre,
                        apellido: userData.Apellido,
                        email: userData.Email,
                        telefono: userData.Telefono,
                        direccion: userData.Direccion,
                        ciudad: userData.Ciudad,
                        pais: userData.Pais
                    } : null
                });
            }

            return res.status(200).json({
                success: true,
                productos: productosList,
                total: productosList.length
            });
        } catch (indexError) {
            // Option 2: Fallback if index doesn't exist - just filter by estado without ordering
            console.log("Falling back to simple query without ordering due to missing index");
            
            const productosSnapshot = await db.collection("Productos")
                .where("Estado", "==", "En bodega")
                .get();

            const productosList = [];

            for (const doc of productosSnapshot.docs) {
                const productoData = doc.data();
                const userDoc = await db.collection("Usuarios")
                    .doc(productoData.Id_user)
                    .get();
                
                const userData = userDoc.exists ? userDoc.data() : null;

                productosList.push({
                    id: doc.id,
                    nombre: productoData.Nombre,
                    descripcion: productoData.Descripcion,
                    peso: Number(productoData.Peso),
                    precio: Number(productoData.Precio),
                    cantidad: parseInt(productoData.Cantidad),
                    link: productoData.Link,
                    imagenUrl: productoData.ImagenUrl,
                    facturaUrl: productoData.FacturaUrl,
                    fechaCreacion: productoData.FechaCreacion?.toDate(),
                    fechaActualizacion: productoData.FechaActualizacion?.toDate(),
                    estado: productoData.Estado,
                    usuario: userData ? {
                        id: userDoc.id,
                        nombre: userData.Nombre,
                        apellido: userData.Apellido,
                        email: userData.Email,
                        telefono: userData.Telefono,
                        direccion: userData.Direccion,
                        ciudad: userData.Ciudad,
                        pais: userData.Pais
                    } : null
                });
            }

            // Sort manually since we can't use orderBy
            productosList.sort((a, b) => {
                if (!a.fechaCreacion || !b.fechaCreacion) return 0;
                return b.fechaCreacion - a.fechaCreacion; // descending order
            });

            return res.status(200).json({
                success: true,
                productos: productosList,
                total: productosList.length,
                indexRequired: true,
                indexUrl: indexError.details
            });
        }
    } catch (error) {
        console.error('Error al obtener productos en bodega:', error);
        return res.status(500).json({
            success: false,
            message: "Error al obtener productos en bodega",
            error: error.message
        });
    }
});
// Endpoint para crear envío detallado
router_admin.post('/envios/detallado', async (req, res) => {
    try {
        const { 
            userId,             // Changed from id_user
            direccion,
            origen,             // New field
            estado,             // New field
            pagoId,             // New field
            productos,
            trackingNumber,     // Changed from numeroSeguimiento
            fechaEstimada,
            fecha,              // New field
            eventos             // New field
        } = req.body;

        if (!userId || !productos || !productos.length || !direccion) {
            return res.status(400).json({
                success: false,
                message: "Datos incompletos para crear el envío"
            });
        }

        // Función para generar número de seguimiento si no se proporciona
        function generateTrackingNumber() {
            const prefix = "ENV";
            const timestamp = Date.now().toString().slice(-6);
            const random = Math.floor(Math.random() * 9000 + 1000);
            return `${prefix}-${timestamp}-${random}`;
        }

        // Preparar eventos iniciales
        const eventosIniciales = eventos || [{
            tipo: "Creación",
            fecha: new Date(),
            descripcion: "Envío creado",
            ubicacion: origen || "Oficina central"
        }];

        // Convertir fechas de string a Date objects
        const fechasEventos = eventosIniciales.map(evento => ({
            ...evento,
            fecha: evento.fecha ? new Date(evento.fecha) : new Date()
        }));

        // Crear el envío con datos detallados
        const envioRef = await db.collection("Envios").add({
            Id_user: userId,
            Productos: productos,
            Direccion: direccion,
            Origen: origen || "Miami, FL",
            PagoId: pagoId || null,
            Fecha: fecha ? new Date(fecha) : new Date(),
            FechaEstimada: fechaEstimada ? new Date(fechaEstimada) : null,
            Estado: estado || "En bodega",
            TrackingNumber: trackingNumber || generateTrackingNumber(),
            Eventos: fechasEventos
        });

        // Actualizar estado de productos
        const batch = db.batch();
        for (const productoId of productos) {
            const productoRef = db.collection("Productos").doc(productoId);
            batch.update(productoRef, { 
                Estado: "En envío",
                FechaEnvio: new Date(),
                IdEnvio: envioRef.id
            });
        }
        await batch.commit();

        // Crear notificación para el usuario
        await db.collection("Notificaciones").add({
            Id_user: userId,
            Titulo: "Envío creado",
            Mensaje: `Tu envío #${trackingNumber || envioRef.id.substring(0, 8)} ha sido creado`,
            Fecha: new Date(),
            Leido: false,
            Tipo: "envio",
            IdEnvio: envioRef.id
        });

        return res.status(201).json({
            success: true,
            message: "Envío creado correctamente",
            envioId: envioRef.id
        });

    } catch (error) {
        console.error('Error al crear envío:', error);
        return res.status(500).json({
            success: false,
            message: "Error al crear envío",
            error: error.message
        });
    }
});

// Endpoint alternativo para crear envío
router_admin.post('/envios', async (req, res) => {
    try {
        const { 
            id_user,
            productos,
            direccion,
            fechaEstimada,
            numeroSeguimiento
        } = req.body;

        if (!id_user || !productos || !direccion) {
            return res.status(400).json({
                success: false,
                message: "Datos incompletos para crear el envío"
            });
        }

        // Función para generar número de seguimiento
        function generateTrackingNumber() {
            const prefix = "ENV";
            const timestamp = Date.now().toString().slice(-6);
            const random = Math.floor(Math.random() * 9000 + 1000);
            return `${prefix}-${timestamp}-${random}`;
        }

        // Obtener datos del usuario
        const userDoc = await db.collection("Usuarios").doc(id_user).get();
        if (!userDoc.exists) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            });
        }
        const userData = userDoc.data();

        // Crear el envío
        const envioRef = await db.collection("Envios").add({
            Id_user: id_user,
            Productos: productos,
            Direccion: direccion,
            Ciudad: userData.Ciudad || '',
            Pais: userData.Pais || '',
            Fecha: new Date(),
            FechaEstimada: fechaEstimada ? new Date(fechaEstimada) : null,
            Estado: "En proceso",
            NumeroSeguimiento: numeroSeguimiento || generateTrackingNumber()
        });

        // Actualizar estado de productos
        const batch = db.batch();
        for (const productoId of productos) {
            const productoRef = db.collection("Productos").doc(productoId);
            batch.update(productoRef, { 
                Estado: "En envío",
                FechaEnvio: new Date(),
                IdEnvio: envioRef.id
            });
        }
        await batch.commit();

        return res.status(201).json({
            success: true,
            message: "Envío creado correctamente",
            envioId: envioRef.id
        });

    } catch (error) {
        console.error('Error al crear envío:', error);
        return res.status(500).json({
            success: false,
            message: "Error al crear envío",
            error: error.message
        });
    }
});

// Función auxiliar para generar números de seguimiento
function generateTrackingNumber() {
    const prefix = "ENV";
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 9000 + 1000);
    return `${prefix}-${timestamp}-${random}`;
}

router_admin.get('/usuarios', async (req, res) => {
    try {
        const usuariosSnapshot = await db.collection("Usuarios").get();
        
        const usuariosList = [];
        
        for (const doc of usuariosSnapshot.docs) {
            const userData = doc.data();
            
            // Excluir la contraseña por seguridad
            usuariosList.push({
                id: doc.id,
                nombre: userData.Nombre,
                apellido: userData.Apellido,
                email: userData.Email,
                direccion: userData.Direccion,
                telefono: userData.Telefono,
                ciudad: userData.Ciudad,
                pais: userData.Pais,
                rol: userData.Rol,
                fechaRegistro: userData.FechaRegistro?.toDate() || null
            });
        }
        
        return res.status(200).json({
            success: true,
            usuarios: usuariosList,
            total: usuariosList.length
        });
        
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        return res.status(500).json({
            success: false,
            message: "Error al obtener usuarios",
            error: error.message
        });
    }
});

// GET user by ID
router_admin.get('/usuarios/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        
        // Validar que el ID de usuario sea válido
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "ID de usuario no proporcionado"
            });
        }
        
        // Obtener documento del usuario
        const userDoc = await db.collection("Usuarios").doc(userId).get();
        
        if (!userDoc.exists) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            });
        }
        
        const userData = userDoc.data();
        
        // Eliminar contraseña de los datos para seguridad
        const { Password, ...userDataWithoutPassword } = userData;
        
        return res.status(200).json({
            success: true,
            usuario: {
                id: userDoc.id,
                nombre: userData.Nombre,
                apellido: userData.Apellido,
                email: userData.Email,
                direccion: userData.Direccion,
                telefono: userData.Telefono,
                ciudad: userData.Ciudad,
                pais: userData.Pais,
                rol: userData.Rol,
                fechaRegistro: userData.FechaRegistro?.toDate() || null
            }
        });
        
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        return res.status(500).json({
            success: false,
            message: "Error al obtener usuario",
            error: error.message
        });
    }
});

// UPDATE user information
router_admin.put('/usuarios/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const { nombre, apellido, email, telefono, direccion, ciudad, pais } = req.body;
        
        // Validar que el ID de usuario sea válido
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "ID de usuario no proporcionado"
            });
        }
        
        // Verificar que el usuario existe
        const userDoc = await db.collection("Usuarios").doc(userId).get();
        if (!userDoc.exists) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            });
        }
        
        // Si se está cambiando el email, verificar que no esté en uso
        if (email) {
            const emailSnapshot = await db.collection("Usuarios")
                .where("Email", "==", email)
                .get();
            
            // Check if any document with the same email exists that's not the current user
            const emailAlreadyInUse = emailSnapshot.docs.some(doc => doc.id !== userId);
            
            if (emailAlreadyInUse) {
                return res.status(400).json({
                    success: false,
                    message: "El email ya está en uso por otro usuario"
                });
            }
        }
        
        // Construir objeto de actualización
        const updateData = {};
        if (nombre) updateData.Nombre = nombre;
        if (apellido) updateData.Apellido = apellido;
        if (email) updateData.Email = email;
        if (telefono) updateData.Telefono = telefono;
        if (direccion) updateData.Direccion = direccion;
        if (ciudad) updateData.Ciudad = ciudad;
        if (pais) updateData.Pais = pais;
        
        // Añadir timestamp de actualización
        updateData.FechaActualizacion = new Date();
        
        // Actualizar el documento
        await db.collection("Usuarios").doc(userId).update(updateData);
        
        return res.status(200).json({
            success: true,
            message: "Usuario actualizado correctamente",
            usuario: {
                id: userId,
                ...updateData
            }
        });
        
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        return res.status(500).json({
            success: false,
            message: "Error al actualizar usuario",
            error: error.message
        });
    }
});
router_admin.put('/usuarios/:userId/password', async (req, res) => {
    try {
        const userId = req.params.userId;
        const { password } = req.body;
        
        // Validar que el ID de usuario sea válido
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "ID de usuario no proporcionado"
            });
        }
        
        // Validar que se proporcionó una contraseña
        if (!password) {
            return res.status(400).json({
                success: false,
                message: "No se proporcionó una nueva contraseña"
            });
        }
        
        // Verificar que el usuario existe
        const userRef = db.collection("Usuarios").doc(userId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            });
        }
        
        try {
            // Hashear la nueva contraseña
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            
            // Actualizar la contraseña
            await userRef.update({
                Password: hashedPassword,
                FechaActualizacion: new Date()
            });
            
            return res.status(200).json({
                success: true,
                message: "Contraseña actualizada correctamente"
            });
        } catch (hashError) {
            console.error('Error al hashear/actualizar contraseña:', hashError);
            return res.status(500).json({
                success: false,
                message: "Error al procesar la contraseña",
                error: hashError.message
            });
        }
    } catch (error) {
        console.error('Error al actualizar contraseña:', error);
        return res.status(500).json({
            success: false,
            message: "Error al actualizar contraseña",
            error: error.message
        });
    }
});

// GET warehouse products for a specific user
router_admin.get('/productos/usuario/:userId/en-bodega', async (req, res) => {
    try {
        const userId = req.params.userId;
        
        // Validar que el ID de usuario sea válido
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "ID de usuario no proporcionado",
                productos: []
            });
        }
        
        // Verificar que el usuario existe
        const userDoc = await db.collection("Usuarios").doc(userId).get();
        if (!userDoc.exists) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado",
                productos: []
            });
        }
        
        const userData = userDoc.data();
        
        // Obtener productos en bodega para este usuario
        const productosSnapshot = await db.collection("Productos")
            .where("Id_user", "==", userId)
            .where("Estado", "==", "En bodega")
            .get();
        
        const productosList = [];
        
        for (const doc of productosSnapshot.docs) {
            const productoData = doc.data();
            
            productosList.push({
                id: doc.id,
                nombre: productoData.Nombre,
                descripcion: productoData.Descripcion,
                peso: Number(productoData.Peso || 0),
                precio: Number(productoData.Precio || 0),
                cantidad: parseInt(productoData.Cantidad || 0),
                link: productoData.Link || '',
                imagenUrl: productoData.ImagenUrl || '',
                facturaUrl: productoData.FacturaUrl || '',
                fechaCreacion: productoData.FechaCreacion?.toDate(),
                fechaActualizacion: productoData.FechaActualizacion?.toDate(),
                estado: productoData.Estado,
                usuario: {
                    id: userDoc.id,
                    nombre: userData.Nombre,
                    apellido: userData.Apellido,
                    email: userData.Email,
                    telefono: userData.Telefono,
                    direccion: userData.Direccion,
                    ciudad: userData.Ciudad,
                    pais: userData.Pais
                }
            });
        }
        
        return res.status(200).json({
            success: true,
            productos: productosList,
            total: productosList.length,
            usuario: {
                id: userDoc.id,
                nombre: userData.Nombre,
                apellido: userData.Apellido,
                email: userData.Email
            }
        });
        
    } catch (error) {
        console.error('Error al obtener productos en bodega del usuario:', error);
        return res.status(500).json({
            success: false,
            message: "Error al obtener productos en bodega del usuario",
            error: error.message,
            productos: []
        });
    }
});

router_admin.post('/pagos', async (req, res) => {
    try {
        const { 
            userId, 
            monto, 
            metodoPago, 
            estado, 
            descripcion, 
            productos, 
            fecha,
            detalles 
        } = req.body;

        // Check required fields
        if (!userId || !monto) {
            return res.status(400).json({
                success: false,
                message: "Datos incompletos para registrar el pago"
            });
        }

        // Registrar el pago
        const pagoRef = await db.collection("Pagos").add({
            Id_user: userId,
            Monto: Number(monto),
            Metodo: metodoPago || 'transferencia_bancaria',
            Productos: productos || [],
            Descripcion: descripcion || '',
            Estado: estado || "Aprobado",
            Fecha: fecha ? new Date(fecha) : new Date(),
            Detalles: detalles || {}
        });

        // Actualizar estado de productos si hay
        if (productos && productos.length > 0) {
            const batch = db.batch();
            
            for (const productoId of productos) {
                const productoRef = db.collection("Productos").doc(productoId);
                batch.update(productoRef, { 
                    Estado: "Pagado",
                    FechaPago: new Date(),
                    IdPago: pagoRef.id
                });
            }
            
            await batch.commit();
        }

        // Notificar al usuario sobre el pago registrado
        await db.collection("Notificaciones").add({
            Id_user: userId,
            Titulo: "Pago registrado",
            Mensaje: `Se ha registrado un pago por $${monto} mediante ${metodoPago}`,
            Fecha: new Date(),
            Leido: false,
            Tipo: "pago",
            IdPago: pagoRef.id
        });

        return res.status(201).json({
            success: true,
            message: "Pago registrado correctamente",
            pagoId: pagoRef.id
        });

    } catch (error) {
        console.error('Error al registrar pago:', error);
        return res.status(500).json({
            success: false,
            message: "Error al registrar pago",
            error: error.message
        });
    }
});
// Endpoint para obtener todos los pagos (administrador)
router_admin.get('/pagos', async (req, res) => {
    try {
        const pagosSnapshot = await db.collection("Pagos")
            .orderBy("Fecha", "desc")
            .get();

        const pagosList = [];

        for (const doc of pagosSnapshot.docs) {
            const pagoData = doc.data();
            
            // Get user info for this payment
            const userDoc = await db.collection("Usuarios")
                .doc(pagoData.Id_user)
                .get();
            
            const userData = userDoc.exists ? userDoc.data() : null;

            pagosList.push({
                id: doc.id,
                monto: pagoData.Monto,
                metodo: pagoData.Metodo,
                fecha: pagoData.Fecha?.toDate(),
                estado: pagoData.Estado || 'Pendiente',
                transactionId: pagoData.TransactionId || '',
                productos: pagoData.Productos || [],
                detalles: pagoData.Detalles || {},
                usuario: userData ? {
                    id: userDoc.id,
                    nombre: userData.Nombre,
                    apellido: userData.Apellido,
                    email: userData.Email
                } : null
            });
        }

        return res.status(200).json({
            success: true,
            pagos: pagosList,
            total: pagosList.length
        });

    } catch (error) {
        console.error('Error al obtener pagos:', error);
        return res.status(500).json({
            success: false,
            message: "Error al obtener pagos",
            error: error.message
        });
    }
});

// Endpoint para crear un nuevo pago (administrador)

// Endpoint para aprobar un pago pendiente
router_admin.put('/pagos/:id/aprobar', async (req, res) => {
    try {
        const pagoId = req.params.id;
        
        const pagoRef = db.collection("Pagos").doc(pagoId);
        const pagoDoc = await pagoRef.get();
        
        if (!pagoDoc.exists) {
            return res.status(404).json({
                success: false,
                message: "Pago no encontrado"
            });
        }
        
        const pagoData = pagoDoc.data();
        
        // Actualizar estado del pago
        await pagoRef.update({
            Estado: "Aprobado",
            FechaAprobacion: new Date()
        });

        // Actualizar estado de productos relacionados
        if (pagoData.Productos && pagoData.Productos.length > 0) {
            const batch = db.batch();
            
            for (const productoId of pagoData.Productos) {
                const productoRef = db.collection("Productos").doc(productoId);
                batch.update(productoRef, { 
                    Estado: "Pagado",
                    FechaPago: new Date()
                });
            }
            
            await batch.commit();
        }

        // Crear notificación para el usuario
        await db.collection("Notificaciones").add({
            Id_user: pagoData.Id_user,
            Titulo: "Pago aprobado",
            Mensaje: "Tu pago ha sido aprobado y procesado correctamente.",
            Fecha: new Date(),
            Leido: false,
            Tipo: "pago",
            IdPago: pagoId
        });

        return res.status(200).json({
            success: true,
            message: "Pago aprobado correctamente"
        });

    } catch (error) {
        console.error('Error al aprobar pago:', error);
        return res.status(500).json({
            success: false,
            message: "Error al aprobar pago",
            error: error.message
        });
    }
});
// Endpoint para obtener todos los usuarios (administrador)
router_admin.get('/usuarios', async (req, res) => {
    try {
        const usuariosSnapshot = await db.collection("Usuarios").get();
        
        const usuariosList = [];
        
        for (const doc of usuariosSnapshot.docs) {
            const userData = doc.data();
            
            // Excluir la contraseña por seguridad
            usuariosList.push({
                id: doc.id,
                nombre: userData.Nombre,
                apellido: userData.Apellido,
                email: userData.Email,
                direccion: userData.Direccion,
                telefono: userData.Telefono,
                ciudad: userData.Ciudad,
                pais: userData.Pais,
                rol: userData.Rol,
                fechaRegistro: userData.FechaRegistro?.toDate() || null
            });
        }
        
        return res.status(200).json({
            success: true,
            usuarios: usuariosList,
            total: usuariosList.length
        });
        
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        return res.status(500).json({
            success: false,
            message: "Error al obtener usuarios",
            error: error.message
        });
    }
});
// Endpoint para obtener productos en bodega de un usuario específico
router_admin.get('/productos/usuario/:userId/en-bodega', async (req, res) => {
    try {
        const userId = req.params.userId;
        
        // Validar que el ID de usuario sea válido
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "ID de usuario no proporcionado",
                productos: []
            });
        }
        
        // Verificar que el usuario existe
        const userDoc = await db.collection("Usuarios").doc(userId).get();
        if (!userDoc.exists) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado",
                productos: []
            });
        }
        
        const userData = userDoc.data();
        
        // Obtener productos en bodega para este usuario
        const productosSnapshot = await db.collection("Productos")
            .where("Id_user", "==", userId)
            .where("Estado", "==", "En bodega")
            .get();
        
        const productosList = [];
        
        for (const doc of productosSnapshot.docs) {
            const productoData = doc.data();
            
            productosList.push({
                id: doc.id,
                nombre: productoData.Nombre,
                descripcion: productoData.Descripcion,
                peso: Number(productoData.Peso || 0),
                precio: Number(productoData.Precio || 0),
                cantidad: parseInt(productoData.Cantidad || 0),
                link: productoData.Link || '',
                imagenUrl: productoData.ImagenUrl || '',
                facturaUrl: productoData.FacturaUrl || '',
                fechaCreacion: productoData.FechaCreacion?.toDate(),
                fechaActualizacion: productoData.FechaActualizacion?.toDate(),
                estado: productoData.Estado,
                usuario: {
                    id: userDoc.id,
                    nombre: userData.Nombre,
                    apellido: userData.Apellido,
                    email: userData.Email,
                    telefono: userData.Telefono,
                    direccion: userData.Direccion,
                    ciudad: userData.Ciudad,
                    pais: userData.Pais
                }
            });
        }
        
        return res.status(200).json({
            success: true,
            productos: productosList,
            total: productosList.length,
            usuario: {
                id: userDoc.id,
                nombre: userData.Nombre,
                apellido: userData.Apellido,
                email: userData.Email
            }
        });
        
    } catch (error) {
        console.error('Error al obtener productos en bodega del usuario:', error);
        return res.status(500).json({
            success: false,
            message: "Error al obtener productos en bodega del usuario",
            error: error.message,
            productos: []
        });
    }
});

router_admin.put('/ActualizarEnvio', async (req, res) => {
    try {
      const { id, estado, nuevoEvento, actualizarTimeline } = req.body;
      
      if (!id || !estado) {
        return res.status(400).json({
          success: false,
          message: "Se requiere ID y estado del envío"
        });
      }
      
      // Get the shipment document
      const shipmentRef = db.collection("Envios").doc(id);
      const shipmentDoc = await shipmentRef.get();
      
      if (!shipmentDoc.exists) {
        return res.status(404).json({
          success: false,
          message: "Envío no encontrado"
        });
      }
      
      // Use manual Date objects instead of admin.firestore functions
      const updateData = {
        Estado: estado,
        FechaActualizacion: new Date()
      };
      
      // If timeline update is requested, add the new event
      if (actualizarTimeline && nuevoEvento) {
        // Use manual date handling
        if (nuevoEvento.fecha) {
          try {
            nuevoEvento.fecha = new Date(nuevoEvento.fecha);
          } catch (e) {
            nuevoEvento.fecha = new Date();
          }
        } else {
          nuevoEvento.fecha = new Date();
        }
        
        // Get current events and append manually
        const currentEvents = shipmentDoc.data().Eventos || [];
        updateData.Eventos = [...currentEvents, nuevoEvento];
      }
      
      // Update the shipment
      await shipmentRef.update(updateData);
      
      // If this status should trigger a notification, create one
      if (['En bodega', 'Entregado'].includes(estado)) {
        // Get user info
        const shipment = shipmentDoc.data();
        const userId = shipment.Id_user;
        
        if (userId) {
          // Create a notification for the user
          await db.collection("Notificaciones").add({
            Id_user: userId,
            Titulo: estado === 'En bodega' ? 'Paquete en bodega' : 'Paquete entregado',
            Mensaje: estado === 'En bodega' 
              ? 'Tu paquete ha llegado a nuestra bodega' 
              : 'Tu paquete ha sido entregado',
            Fecha: new Date(),
            Leido: false,
            Tipo: 'shipment',
            IdEnvio: id
          });
        }
      }
      
      return res.status(200).json({
        success: true,
        message: "Estado del envío actualizado correctamente",
        timelineUpdated: actualizarTimeline
      });
      
    } catch (error) {
      console.error('Error al actualizar estado del envío:', error);
      return res.status(500).json({
        success: false,
        message: "Error al actualizar estado del envío",
        error: error.message
      });
    }
});
router_admin.post('/RegistrarProductos', async (req, res) => {
    try {
        const produref = await db.collection('Productos').add({
            Id_user: req.body.id_user,
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
                usuario: req.body.id_user  // Changed from req.user.id to req.body.id_user
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
        console.error("Error registrando producto:", error);
        return res.status(400).json({
            message: "Error al registrar producto",
            error: error.message
        });
    }
});
// ...existing code...

router_admin.put('/productos/:id', async (req, res) => {
    try {
      const productId = req.params.id;
      
      // Get the product reference
      const productRef = db.collection('Productos').doc(productId);
      const productDoc = await productRef.get();
      
      if (!productDoc.exists) {
        return res.status(404).json({
          success: false,
          message: "Producto no encontrado"
        });
      }
  
      // Update only the fields provided in the request
      const updateData = {};
      if (req.body.nombre) updateData.Nombre = req.body.nombre;
      if (req.body.descripcion) updateData.Descripcion = req.body.descripcion;
      if (req.body.peso) updateData.Peso = Number(req.body.peso);
      if (req.body.precio) updateData.Precio = Number(req.body.precio);
      if (req.body.cantidad) updateData.Cantidad = parseInt(req.body.cantidad);
      if (req.body.link) updateData.Link = req.body.link;
      if (req.body.imagenUrl) updateData.ImagenUrl = req.body.imagenUrl;
      if (req.body.facturaUrl) updateData.FacturaUrl = req.body.facturaUrl;
      
      // Update the document
      await productRef.update(updateData);
      
      return res.status(200).json({
        success: true,
        message: "Producto actualizado exitosamente"
      });
      
    } catch (error) {
      console.error("Error actualizando producto:", error);
      return res.status(500).json({
        success: false,
        message: "Error al actualizar producto",
        error: error.message
      });
    }
  });
  

router_admin.get('/MostrarEnvios', async (req, res) => {
    try {
        // Get pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // Get all shipments ordered by date
        const enviosSnapshot = await db.collection("Envios")
            .orderBy("Fecha", "desc")
            .limit(limit)
            .offset(offset)
            .get();

        const enviosList = [];

        // Process each shipment
        for (const doc of enviosSnapshot.docs) {
            const envioData = doc.data();
            
            // Get user info for this shipment
            const userDoc = await db.collection("Usuarios")
                .doc(envioData.Id_user)
                .get();
            
            const userData = userDoc.exists ? userDoc.data() : null;
            
            // Safe date conversion function
            const safeToDate = (fieldValue) => {
                try {
                    if (!fieldValue) return null;
                    
                    if (typeof fieldValue.toDate === 'function') {
                        return fieldValue.toDate();
                    }
                    
                    if (fieldValue instanceof Date) {
                        return fieldValue;
                    }
                    
                    return new Date(fieldValue);
                } catch (e) {
                    console.warn(`Error converting date field:`, e);
                    return null;
                }
            };

            enviosList.push({
                id: doc.id,
                direccion: envioData.Direccion,
                productos: envioData.Productos || [],
                pagoId: envioData.PagoId,
                fecha: safeToDate(envioData.Fecha),
                fechaEstimada: envioData.FechaEstimada ? safeToDate(envioData.FechaEstimada) : null,
                estado: envioData.Estado || 'Pendiente',
                numeroSeguimiento: envioData.TrackingNumber || '',
                usuario: userData ? {
                    id: userDoc.id,
                    nombre: userData.Nombre,
                    apellido: userData.Apellido,
                    email: userData.Email,
                    telefono: userData.Telefono
                } : null
            });
        }

        // Get total count
        const totalSnapshot = await db.collection("Envios").get();
        const total = totalSnapshot.size;

        return res.status(200).json({
            success: true,
            data: enviosList,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error al obtener envíos:', error);
        return res.status(500).json({
            success: false,
            message: "Error al obtener envíos",
            error: error.message
        });
    }
});
router_admin.put('/ActualizarEstadoProducto/:id', async (req, res) => {
    try {
        const productoId = req.params.id;
        const nuevoEstado = req.body.estado;
        
        const estadosValidos = ['No llegado', 'En bodega', 'Pagado'];
        if (!estadosValidos.includes(nuevoEstado)) {
            return res.status(400).json({
                success: false,
                message: "Estado no válido"
            });
        }

        const productoRef = db.collection('Productos').doc(productoId);
        const doc = await productoRef.get();

        if (!doc.exists) {
            return res.status(404).json({ 
                success: false,
                message: "Producto no encontrado" 
            });
        }

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

// Add this endpoint to your admin routes

// GET admin statistics 
router_admin.get('/stats', async (req, res) => {
    try {
        // Count total users
        const usersSnapshot = await db.collection("Usuarios").get();
        const totalUsers = usersSnapshot.size;
        
        // Count total products
        const productsSnapshot = await db.collection("Productos").get();
        const totalProducts = productsSnapshot.size;
        const productsSnapshots = await db.collection("Envios").get();
        // Count products by status
        let productsInWarehouse = 0;
        let productsInTransit = 0;
        let productsDelivered = 0;
        
        for (const doc of productsSnapshots.docs) {
            const estado = doc.data().Estado?.toLowerCase() || '';
            
            if (estado === 'en bodega') {
                productsInWarehouse++;
            } else if (estado === 'en tránsito' || estado === 'en transito') {
                productsInTransit++;
            } else if (estado === 'entregado') {
                productsDelivered++;
            }
        }
        
        // Count shipments
        const shipmentsSnapshot = await db.collection("Envios").get();
        const totalShipments = shipmentsSnapshot.size;
        
        // Count pending payments
        const paymentsSnapshot = await db.collection("Productos")
        .where("Estado", "in", ["No llegado", "En bodega"])
            .get();
        const pendingPayments = paymentsSnapshot.size;
        
        // Calculate total revenue
        const allPaymentsSnapshot = await db.collection("Pagos")
            .where("Estado", "==", "Completado")
            .get();
            
        let revenue = 0;
        for (const doc of allPaymentsSnapshot.docs) {
            revenue += Number(doc.data().Monto || 0);
        }
        
        return res.status(200).json({
            success: true,
            totalUsers,
            totalProducts,
            totalShipments,
            pendingPayments,
            productsInWarehouse,
            productsInTransit,
            productsDelivered,
            revenue
        });
        
    } catch (error) {
        console.error('Error obteniendo estadísticas admin:', error);
        return res.status(500).json({
            success: false,
            message: "Error al obtener estadísticas",
            error: error.message
        });
    }
});
// Add this endpoint to your admin routes

// GET monthly revenue statistics
router_admin.get('/stats/monthly-revenue', async (req, res) => {
    try {
        // Get completed payments
        const paymentsSnapshot = await db.collection("Pagos")
        .where("Estado", "in", ["Completado", "Aprovado"])
            .get();
            
        // Group payments by year and month
        const monthlyData = {};
        
        for (const doc of paymentsSnapshot.docs) {
            const paymentData = doc.data();
            const amount = Number(paymentData.Monto || 0);
            
            // Get payment date
            let paymentDate;
            if (paymentData.FechaCreacion) {
                paymentDate = paymentData.FechaCreacion.toDate();
            } else {
                // If no creation date, use current date (not ideal)
                paymentDate = new Date();
            }
            
            const year = paymentDate.getFullYear();
            const month = paymentDate.getMonth() + 1; // JavaScript months are 0-indexed
            
            // Create year entry if it doesn't exist
            if (!monthlyData[year]) {
                monthlyData[year] = {};
            }
            
            // Create month entry if it doesn't exist
            if (!monthlyData[year][month]) {
                monthlyData[year][month] = {
                    revenue: 0,
                    count: 0
                };
            }
            
            // Add to monthly total
            monthlyData[year][month].revenue += amount;
            monthlyData[year][month].count += 1;
        }
        
        // Convert to array format for easier client-side processing
        const result = [];
        
        for (const year in monthlyData) {
            for (const month in monthlyData[year]) {
                result.push({
                    year: parseInt(year),
                    month: parseInt(month),
                    revenue: monthlyData[year][month].revenue,
                    count: monthlyData[year][month].count
                });
            }
        }
        
        return res.status(200).json({
            success: true,
            monthlyData: result
        });
        
    } catch (error) {
        console.error('Error obteniendo estadísticas de ingresos mensuales:', error);
        return res.status(500).json({
            success: false,
            message: "Error al obtener estadísticas de ingresos mensuales",
            error: error.message
        });
    }
});
module.exports=router_admin;