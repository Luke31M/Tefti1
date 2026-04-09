/* navbar.js - Solución robusta para sesión y navegación global */

// 1. FUNCIONES GLOBALES DE CIERRE DE SESIÓN (Disponibles inmediatamente)
window.cerrarSesionTurista = function() {
    console.log("Iniciando cierre de sesión Turista...");
    if (confirm("¿Estás seguro que deseas cerrar tu sesión de turista?")) {
        localStorage.removeItem('tefti_sesion');
        localStorage.removeItem('tefti_correo_usuario');
        localStorage.removeItem('tefti_nombre_usuario');
        console.log("Sesión Turista eliminada. Redirigiendo...");
        window.location.href = 'app.html';
    }
};

window.cerrarSesionLocal = function() {
    console.log("Iniciando cierre de sesión Local...");
    if (confirm("¿Estás seguro que deseas cerrar tu sesión administrativa?")) {
        localStorage.removeItem('tefti_sesion_local');
        localStorage.removeItem('tefti_correo_local');
        localStorage.removeItem('tefti_nombre_local');
        console.log("Sesión Local eliminada. Redirigiendo...");
        window.location.href = 'login local.html';
    }
};


// CSS Global para las Navbars (Modo Claro y Oscuro)
const navbarStyles = `
<style>
    /* Estilos base Navbar Normal */
    .navbar { display: flex; justify-content: space-between; align-items: center; background: #fff; padding: 10px 30px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); position: sticky; top: 0; z-index: 1000; }
    .nav-brand { display: flex; align-items: center; gap: 15px; }
    .nav-brand img { height: 40px; }
    .nav-brand-text { line-height: 1.2; }
    .nav-title { font-size: 22px; font-weight: bold; margin: 0; color: #000; }
    .nav-subtitle { font-size: 11px; color: #666; }
    .nav-verified { font-size: 11px; color:  #2ecc71; font-weight: bold; }
    .nav-links { display: flex; gap: 10px; }
    .nav-links a { padding: 8px 15px; border-radius: 6px; font-size: 14px; font-weight: 500; background: #fff; border: 1px solid #ddd; transition: 0.2s; text-decoration: none; color: inherit; }
    .nav-links a:hover, .nav-links a.active { background: #27ae60; color: white; border-color: #27ae60; }
    .nav-options { display: flex; align-items: center; gap: 15px; font-size: 14px; color: #555; }
    .nav-options span, .nav-options a { cursor: pointer; text-decoration: none; }
    .btn-login-nav { background: #27ae60; color: white !important; padding: 6px 15px; border-radius: 20px; font-weight: bold; }
    .btn-login-nav:hover { background: #1e8449; }
    
    @media (max-width: 900px) { .navbar { flex-direction: column; gap: 15px; text-align: center; } }

    /* Estilos base Navbar Local / Corp */
    .navbar-local { display: flex; justify-content: space-between; align-items: center; background: #fff; padding: 10px 30px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); position: sticky; top: 0; z-index: 1000; border-top: 4px solid #27ae60; }
    .nav-brand-l { display: flex; align-items: center; gap: 15px; }
    .nav-title-l { font-size: 22px; font-weight: bold; margin: 0; color: #27ae60; }
    .nav-subtitle-l { font-size: 11px; color: #666; font-weight: bold; }
    .nav-verified-l { font-size: 11px; color: #27ae60; font-weight: bold; display: flex; align-items: center; gap: 5px; }
    .nav-links-l { display: flex; gap: 10px; }
    .nav-links-l a { padding: 8px 15px; border-radius: 6px; font-size: 14px; font-weight: 600; background: #fff; border: 1px solid #ddd; transition: 0.2s; text-decoration: none; color: #333; }
    .nav-links-l a:hover, .nav-links-l a.active { background: #27ae60; color: white; border-color: #27ae60; }
    .nav-options-l { display: flex; align-items: center; gap: 15px; font-size: 14px; color: #555; }
    .nav-options-l span, .nav-options-l a { cursor: pointer; text-decoration: none; }
    
    @media (max-width: 900px) { .navbar-local { flex-direction: column; gap: 15px; text-align: center; } }

    /* MODO OSCURO GLOBAL (Common) */
    body.dark-mode .navbar, body.dark-mode .navbar-local { background-color: #111 !important; border-bottom: 1px solid #333 !important; }
    body.dark-mode .nav-title, body.dark-mode .nav-title-l { color: #ffffff !important; }
    body.dark-mode .nav-links a, body.dark-mode .nav-links-l a { background-color: #222 !important; color: #ffffff !important; border-color: #444 !important; }
    body.dark-mode .nav-links a.active, body.dark-mode .nav-links a:hover, body.dark-mode .nav-links-l a.active, body.dark-mode .nav-links-l a:hover { 
        background-color: #2ecc71 !important; color: #000 !important; border-color: #2ecc71 !important; box-shadow: 0 0 12px rgba(12, 235, 161, 0.4) !important;
    }
    body.dark-mode .nav-options span, body.dark-mode .nav-options-l span, body.dark-mode .nav-options-l a { color: #aaa !important; }
</style>
`;

const navbarHTML_Normal = `
<header class="navbar">
    <div class="nav-brand">
        <img src="/img/Logo.png" alt="Logo" style="height: 40px;">
        <div class="nav-brand-text">
            <h1 class="nav-title">TEFTI</h1>
            <div class="nav-subtitle">PLATAFORMA INTEGRAL DE SERVICIOS</div>
            <div class="nav-verified">✔ VERIFIED BY TILINES.WORK</div>
        </div>
    </div>
    <nav class="nav-links">
        <a href="index.html" id="nav-inicio">🏠 INICIO</a>
        <a href="Chatbot.html" id="nav-chatbot">💬 CHATBOT</a>
        <a href="Locales.html" id="nav-locales">📍 LOCALES</a>
        <a href="Cuenta.html" id="nav-cuenta">👤 MI CUENTA</a>
    </nav>
    <div class="nav-options">
        <a href="app.html" id="nav-btn-login" class="btn-login-nav">Iniciar Sesión</a>
        <a href="#" id="nav-btn-logout" class="btn-login-nav" style="display: none; background: #dc3545;" onclick="cerrarSesionTurista()">Cerrar Sesión</a>
        <a href="Configuracion.html" id="nav-btn-config" style="display: none;">⚙️</a>
    </div>
</header>
`;

const navbarHTML_Local = `
<header class="navbar-local">
    <div class="nav-brand-l">
        <img src="/img/Logo.png" alt="Logo" style="height: 40px; margin-right: 15px;">
        <div class="nav-brand-text">
            <h1 class="nav-title-l">TEFTI Negocios</h1>
            <div class="nav-subtitle-l">ADMINISTRACIÓN DE LOCAL</div>
            <div class="nav-verified-l">✔ VERIFIED BY TILINES.WORK</div>
        </div>
    </div>
    <nav class="nav-links-l">
        <a href="Inicio.html" id="nav-inicio-local">🏠 INICIO LOCAL</a>
        <a href="PanelLocal.html" id="nav-panel">📊 MI PANEL</a>
        <a href="Configuracion.html" id="nav-config">⚙️ AJUSTES</a>
    </nav>
    <div class="nav-options-l">
        <a href="#" style="background: transparent; border: 2px solid #dc3545; border-radius: 20px; padding: 5px 12px; color: #dc3545; font-weight: bold;" onclick="cerrarSesionLocal()">Cerrar sesión</a>
    </div>
</header>
`;


function cargarNavbar() {
    const container = document.getElementById('navbar-container');
    if (!container) return;

    const esLocalActivo = localStorage.getItem('tefti_sesion_local') === 'activa';
    
    // Inyecta estilos + navbar correspondiente
    if (esLocalActivo) {
        container.innerHTML = navbarStyles + navbarHTML_Local;
    } else {
        container.innerHTML = navbarStyles + navbarHTML_Normal;
    }
    
    // Resalta automáticamente la pestaña actual
    const path = window.location.pathname.split("/").pop();
    const paginaActual = path || (esLocalActivo ? 'Inicio.html' : 'index.html');
    
    const selectorNav = esLocalActivo ? '.nav-links-l a' : '.nav-links a';
    
    const enlaces = document.querySelectorAll(selectorNav);
    enlaces.forEach(enlace => {
        enlace.classList.remove('active');
        const href = enlace.getAttribute('href').toLowerCase();
        if (href === paginaActual.toLowerCase()) {
            enlace.classList.add('active');
        }
    });

    // Muestra la tuerca y gestiona login/logout si es usuario normal
    if (!esLocalActivo) {
        const estadoSesion = localStorage.getItem('tefti_sesion');
        const btnConfig = document.getElementById('nav-btn-config');
        const btnLogin = document.getElementById('nav-btn-login');
        const btnLogout = document.getElementById('nav-btn-logout');

        if (btnConfig) btnConfig.style.display = 'inline';
        
        if (estadoSesion === 'activa' || estadoSesion === 'invitado') {
            if (btnLogin) btnLogin.style.display = 'none';
            if (btnLogout) btnLogout.style.display = 'inline';
        } else {
            if (btnLogin) btnLogin.style.display = 'inline';
            if (btnLogout) btnLogout.style.display = 'none';
        }
    }
}
document.addEventListener('DOMContentLoaded', cargarNavbar);

// ==========================================
// TRADUCTOR MULTI-IDIOMA CON GOOGLE API (GLOBAL)
// ==========================================
function inyectarTraductorEnNavbar() {
    const idioma = localStorage.getItem('tefti_idioma');
    // Si no hay idioma guardado o es español, evitamos cargar el API
    if (!idioma || idioma === 'es') return;

    if (!document.getElementById('google_translate_script_nav')) {
        const div = document.createElement('div');
        div.id = 'google_translate_element';
        div.style.display = 'none'; // Oculto
        document.body.appendChild(div);

        window.googleTranslateElementInit = function() {
            new google.translate.TranslateElement({pageLanguage: 'es'}, 'google_translate_element');
        };

        const script = document.createElement('script');
        script.id = 'google_translate_script_nav';
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
}

document.addEventListener("DOMContentLoaded", inyectarTraductorEnNavbar);
