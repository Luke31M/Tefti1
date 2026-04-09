// ==========================================
// 0. CONFIGURACIÓN DE FIREBASE (Con verificación de seguridad)
// ==========================================
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD7W7FRC9GYt1qVD2NJhYe46xPauEA_URc",
  authDomain: "tefti-82830.firebaseapp.com",
  projectId: "tefti-82830",
  storageBucket: "tefti-82830.firebasestorage.app",
  messagingSenderId: "999337237077",
  appId: "1:999337237077:web:a3dc458d2dc009072b92dc",
  measurementId: "G-73LDTYYTQ9"
};

// Variables globales para Auth
let auth;
let googleProvider;

// Solo inicializamos si Firebase está presente en el HTML
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    googleProvider = new firebase.auth.GoogleAuthProvider();
} else {
    console.log("Aviso: Firebase no detectado en esta página. Las funciones de login no estarán disponibles aquí.");
}

// ==========================================
// 1. VERIFICACIÓN DE SESIÓN Y TRANSICIONES
// ==========================================
const sesionGuardada = localStorage.getItem('tefti_sesion');
if (sesionGuardada === 'activa' || sesionGuardada === 'invitado') {
    window.location.href = 'index.html';
} else {
    setTimeout(() => {
        const intro = document.getElementById('pantallaIntroF');
        const idioma = document.getElementById('pantallaIdiomaF');
        if(intro && idioma) {
            intro.classList.remove('activaF');
            idioma.classList.add('activaF');
        }
    }, 3500); 
}

function seleccionarIdiomaF(idioma) {
    console.log("El turista eligió el idioma: " + idioma);
    localStorage.setItem('tefti_idioma', idioma);

    // Si no es español, configuramos el Autotraductor de Google
    if (idioma !== 'es') {
        document.cookie = `googtrans=/es/${idioma}; path=/;`;
        document.cookie = `googtrans=/es/${idioma}; domain=.${window.location.hostname}; path=/;`;
    } else {
        // Limpiamos la cookie de traducción si es español
        document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=.${window.location.hostname}; path=/;`;
        
        // Si el idioma es español, podemos borrar cualquier frame existente
        const frame = document.querySelector('.goog-te-banner-frame');
        if(frame) frame.remove();
    }

    // Inyectamos el traductor de forma inmediata en esta página
    inyectarTraductor();

    // ==========================================
    // MAGIA: Forzar traducción automática sin recargar la página
    // Buscamos el selector oculto de Google y le cambiamos el valor
    // ==========================================
    if (idioma !== 'es') {
        let intentos = 0;
        const forzarTraduccion = setInterval(() => {
            const combo = document.querySelector('.goog-te-combo');
            if (combo) {
                combo.value = idioma;
                combo.dispatchEvent(new Event('change'));
                clearInterval(forzarTraduccion);
            }
            // Dejar de buscar después de 20 intentos (~4 segundos)
            intentos++;
            if (intentos > 20) clearInterval(forzarTraduccion);
        }, 200);
    } else {
        // Si eligió español y ya estaba traducido, forzamos regresar al original
        const body = document.querySelector('body');
        if(body.classList.contains('translated-ltr') || body.classList.contains('translated-rtl')) {
             const frameDest = document.getElementById(':1.container') || document.querySelector('iframe.goog-te-banner-frame');
             if (frameDest && frameDest.contentWindow) {
                 const restoreBtn = frameDest.contentWindow.document.getElementById(':1.restore');
                 if(restoreBtn) restoreBtn.click();
             }
        }
    }

    const pantallaIdioma = document.getElementById('pantallaIdiomaF');
    const pantallaLogin = document.getElementById('pantallaLoginF');
    
    if(pantallaIdioma) pantallaIdioma.classList.remove('activaF');
    if(pantallaLogin) pantallaLogin.classList.add('activaF');
}

// ==========================================
// TRADUCTOR MULTI-IDIOMA CON GOOGLE API
// ==========================================
function inyectarTraductor() {
    // Leer idioma: primero de la config del usuario actual, luego del key genérico
    const correo = localStorage.getItem('tefti_correo_usuario') 
                || localStorage.getItem('tefti_correo_local') 
                || 'invitado';
    const configKey = `tefti_config_${correo}`;
    const configUsuario = JSON.parse(localStorage.getItem(configKey));
    
    // Prioridad: config del usuario → key genérico de idioma
    const idioma = (configUsuario && configUsuario.idioma) 
                 ? configUsuario.idioma 
                 : localStorage.getItem('tefti_idioma');

    if (!idioma || idioma === 'es') return;

    if (!document.getElementById('google_translate_script')) {
        const div = document.createElement('div');
        div.id = 'google_translate_element';
        div.style.display = 'none'; // Ocultamos el widget nativo de Google porque lo manejamos por código
        document.body.appendChild(div);

        window.googleTranslateElementInit = function() {
            new google.translate.TranslateElement({pageLanguage: 'es'}, 'google_translate_element');
        };

        const script = document.createElement('script');
        script.id = 'google_translate_script';
        script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        document.body.appendChild(script);
        
        // Estilos ultra-agresivos para ocultar CUALQUIER rastro visual de Google Translate
        const style = document.createElement('style');
        style.innerHTML = `
            /* Ocultar barra superior y marcos */
            .goog-te-banner-frame.skiptranslate { display: none !important; } 
            .skiptranslate iframe { display: none !important; }
            body { top: 0px !important; position: static !important; margin-top: 0px !important; }
            
            /* Ocultar popups flotantes y tooltips al pasar el mouse */
            #goog-gt-tt, .goog-te-balloon-frame { display: none !important; } 
            .goog-tooltip, .goog-tooltip:hover { display: none !important; }
            
            /* Quitar el fondo amarillo mágico de los textos traducidos al seleccionarlos */
            .goog-text-highlight { background-color: transparent !important; box-shadow: none !important; border: none !important; }
            
            /* Ocultar widget inferior / lateral */
            .VIpgJd-ZVi9od-aZ2wEe-wOHMyf, .VIpgJd-ZVi9od-aZ2wEe-wOHMyf-ti6hGc { display: none !important; }
        `;
        document.head.appendChild(style);
    }

    // Forzar el idioma en el combo de Google translate (si ya estaba cargado)
    let intentos = 0;
    const forzar = setInterval(() => {
        const combo = document.querySelector('.goog-te-combo');
        if (combo) {
            combo.value = idioma;
            combo.dispatchEvent(new Event('change'));
            clearInterval(forzar);
        }
        if (++intentos > 30) clearInterval(forzar);
    }, 200);
}

// Inyectar el traductor automáticamente al cargar cualquier página que tenga logica.js
document.addEventListener("DOMContentLoaded", inyectarTraductor);


// ==========================================
// 2. AUTENTICACIÓN (GOOGLE Y MANUAL)
// ==========================================

async function iniciarSesionGoogleF() {
    // Si intentan usar Google y no cargaste los scripts, avisamos
    if (!auth) {
        alert("Error: Los servicios de Google no están cargados en esta página.");
        return;
    }

    try {
        const result = await auth.signInWithPopup(googleProvider);
        const user = result.user;

        const datosUsuario = {
            nombre: user.displayName,
            correo: user.email,
            password: user.uid 
        };

        const resultado = await registrarUsuario(datosUsuario.nombre, datosUsuario.correo, datosUsuario.password);

        if (resultado._id || resultado.correo) {
            localStorage.setItem('tefti_sesion', 'activa');
            localStorage.removeItem('tefti_sesion_local'); // Evitar conflicto de Navbar
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error("Error en Google Auth:", error);
        alert("Hubo un problema al conectar con Google.");
    }
}

// Reemplaza tu función actual por esta:
async function registrarUsuarioManual(e) {
    if(e) e.preventDefault(); 
    
    const correo = document.getElementById('correo').value;
    const password = document.getElementById('password').value;
    
    if(!correo || !password) {
        alert("Por favor ingresa tu correo y contraseña.");
        return;
    }

    try {
        // Obtenemos el nombre del formulario (de loginUsuario.html), o por defecto desde el correo 
        const inputUsername = document.getElementById('username');
        const nombreStr = (inputUsername && inputUsername.value) ? inputUsername.value : correo.split('@')[0];

        // 1. Intentar iniciar sesión o registrar en Firebase (Solo si está disponible)
        if (typeof auth !== 'undefined' && auth) {
            try {
                await auth.signInWithEmailAndPassword(correo, password);
            } catch (error) {
                // Si el usuario no existe en Firebase, lo crea
                try {
                    await auth.createUserWithEmailAndPassword(correo, password);
                } catch (ferr) {
                    console.warn("Aviso Firebase: No se pudo verificar en la nube de Google, pero se guardará localmente.");
                }
            }
        }

        // 2. Intentar INICIAR SESIÓN primero en MongoDB
        let resultado = await iniciarSesionBackend(correo, password);

        // Si login falla, intentamos REGISTRAR
        if (!resultado || (!resultado._id && !resultado.correo)) {
            resultado = await registrarUsuario(nombreStr, correo, password);
        }
        
        // Verificamos que MongoDB respondió con éxito (Devuelve el documento si funcionó)
        if(resultado && (resultado._id || resultado.correo)) {
            localStorage.setItem('tefti_sesion', 'activa');
            localStorage.setItem('tefti_correo_usuario', correo);
            localStorage.setItem('tefti_nombre_usuario', resultado.nombre || nombreStr);
            localStorage.removeItem('tefti_sesion_local'); // Para que la NavBar sea la de usuario
            window.location.href = 'index.html'; // Redirige al inicio para Turistas
        } else {
            console.error(resultado);
            alert(resultado.error || "El correo ya está registrado con otra contraseña, o hubo un error.");
        }

    } catch (error) {
        console.error("Error en logic js:", error);
        alert("Ocurrió un problema inesperado: " + error.message);
    }
}

// ==========================================
// 3. NAVEGACIÓN GENERAL
// ==========================================
function entrarInvitadoF() {
    localStorage.setItem('tefti_sesion', 'invitado');
    localStorage.removeItem('tefti_sesion_local'); // Asegurar que no se vea el panel de locatario
    window.location.href = 'index.html';
}

function irLocatariosF() {
    document.getElementById('pantallaLoginF').classList.remove('activaF');
    document.getElementById('pantallaLocatariosIntroF').classList.add('activaF');
}

function volverAInicioF() {
    document.getElementById('pantallaLocatariosIntroF').classList.remove('activaF');
    document.getElementById('pantallaLoginF').classList.add('activaF');
}

// ==========================================
// 4. SECCIÓN DE LOCATARIOS
// ==========================================
function mostrarRegistroLocatarioF() {
    window.location.href = 'registroLocatario.html';
}

function volverAVestidorF() {
    window.location.href = 'app.html';
}

function finalizarRegistroF() {
    alert("¡Local guardado en TEFTI!");
    // Al registrarse, el locatario inicia sesión administrativa automáticamente
    localStorage.setItem('tefti_sesion_local', 'activa');
    localStorage.removeItem('tefti_sesion'); // Limpiar sesión de turista para evitar conflictos
    window.location.href = 'PanelLocal.html';
}

function mostrarLoginLocatarioF() {
    // Redirige al inicio de sesión exclusivo para negocios/locatarios
    window.location.href = 'login local.html';
}

// ==========================================
// 5. CONEXIÓN CON EL BACKEND (MongoDB)
// ==========================================
async function registrarUsuario(nombre, correo, password) {
    try {
        const respuesta = await fetch(API_URL + '/api/users/registro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, correo, password })
        });
        return await respuesta.json();
    } catch (error) {
        console.error("Error al conectar con el servidor para registro:", error);
        return { error: "No se pudo conectar al servidor." };
    }
}

async function iniciarSesionBackend(correo, password) {
    try {
        const respuesta = await fetch(API_URL + '/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo, password })
        });
        if (respuesta.ok) {
            return await respuesta.json();
        } else {
            return null; // Forzamos a que si falla intente registrarlo (si era nuevo)
        }
    } catch (error) {
        console.error("Error al conectar con el servidor para login:", error);
        return null;
    }
}

// ==========================================
// 6. ASIGNACIÓN DE EVENTOS (Reemplaza la parte final por esto)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const btnGoogle = document.getElementById('btn-google');
    const btnEntrar = document.getElementById('btn-registrar'); // Ahora busca el botón directamente

    if(btnGoogle) {
        btnGoogle.addEventListener('click', iniciarSesionGoogleF);
    }
    
    if(btnEntrar) {
        btnEntrar.addEventListener('click', registrarUsuarioManual);
    }
});
