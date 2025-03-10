const admin = require("firebase-admin");
const dotenv = require('dotenv');
dotenv.config();

// Configuración de Firebase usando variables de entorno
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
});

// Inicializa Firestore
const db = admin.firestore();
console.log("Firebase conectado correctamente");
module.exports = db;