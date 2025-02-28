const admin = require("firebase-admin");
const dotenv = require('dotenv');
dotenv.config();

// Carga la configuración desde el archivo JSON
const serviceAccount = require("../bd_firestore/clave.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Inicializa Firestore
const db = admin.firestore();
console.log("Firebase conectado correctamente");
module.exports = db;