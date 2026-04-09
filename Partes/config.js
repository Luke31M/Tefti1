/* config.js - Configuración global de la plataforma TEFTI */

// Cambia esta URL por la de tu backend en Railway cuando lo despliegues
// Ejemplo: "https://tefti-backend-production.up.railway.app"
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000' 
    : 'https://TU_URL_DE_RAILWAY_AQUI.up.railway.app'; 

console.log("TEFTI API URL configurada en:", API_URL);
