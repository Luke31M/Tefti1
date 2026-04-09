fetch('http://localhost:3000/api/users/registro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
        nombre: "Usuario Prueba", 
        correo: "prueba@tefti.com", 
        password: "password123" 
    })
})
.then(res => res.json())
.then(data => console.log("Usuario guardado:", data))
.catch(err => console.error(err));
