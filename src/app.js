const express = require('express');
const session = require('express-session');
const hbs = require('hbs');
const pool = require('./db'); // Importamos la configuración de la base de datos
const path = require('path');

const app = express();

// Configurar la sesión
app.use(session({
    secret: 'mysecret',  // Cambia este secreto
    resave: false,
    saveUninitialized: true
}));

// Configurar el motor de plantillas
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));  // Asegúrate de que apunte correctamente a tu carpeta de vistas
app.use(express.static(__dirname + '/public'));

// Middleware para parsing
app.use(express.urlencoded({ extended: false }));

// Ruta para mostrar el formulario de login
app.get('/login', (req, res) => {
    res.render('login/login');
});

// Ruta para manejar el login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [results] = await pool.query('SELECT * FROM usuarios WHERE email = ? AND password = ?', [email, password]);

        if (results.length > 0) {
            req.session.user = results[0];
            req.session.loggedin = true;  // Set logged in status

            const role = results[0].role;

            if (role === 'admin') {
                return res.redirect('/menuAdministrativo');
            } else if (role === 'tecnico') {
                return res.redirect('/tecnico');
            } else if (role === 'cliente') {
                return res.redirect('/cliente');
            }
        } else {
            res.render('login/login', { error: 'Correo o contraseña incorrectos' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Ruta para el menú administrativo
app.get('/menuAdministrativo', (req, res) => {
    if (req.session.loggedin === true) {
        const nombreUsuario = req.session.user.name; // Use user session data
        res.render('administrativo/menuadministrativo.hbs', { nombreUsuario });
    } else {
        res.redirect('/login');
    }
});



// Ruta para el menú administrativo
app.get('/geolocalizacion', (req, res) => {
    if (req.session.loggedin === true) {
        const nombreUsuario = req.session.user.name; // Use user session data
        res.render('administrativo/mapa/ver_mapa.hbs', { nombreUsuario });
    } else {
        res.redirect('/login');
    }
});






// Ruta para manejar el cierre de sesión
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Error al cerrar sesión' });
        }
        res.redirect('/login');  // Redirige al usuario a la página de login
    });
});

// Iniciar el servidor
app.listen(3000, () => {
    console.log('Servidor corriendo en el puerto 3000');
});
