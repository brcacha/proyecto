/* Carga de la base de datos */

const sqlite3 = require('sqlite3')
base_datos = new sqlite3.Database('base_datos.db',
    (err) => {
        if (err != null) {
            console.log('Error al abrir BD')
            process.exit()
        }
    }
)

/* Inicialización de express */

const express = require('express')
const servidor = express()

const bodyParser = require("body-parser");
servidor.use(bodyParser.urlencoded({
    extended: true
}));

/**bodyParser.json(options)
 * Parses the text as JSON and exposes the resulting object on req.body.
 */
servidor.use(bodyParser.json());


const cookieParser = require('cookie-parser')
servidor.use(cookieParser())

servidor.listen(8080, () => console.log('En marcha'))

// Definimos ruta para carpeta public (bootstrap, css ...)
servidor.use(express.static(__dirname + '/public/'));

/*
    RUTAS PUBLICAS
*/

// LANDING
servidor.get('/', [
    (peticion, respuesta) => respuesta.sendFile(__dirname + 'public/index.html')
])

// SIGN IN
servidor.get('/signin', [
    (peticion, respuesta) => respuesta.sendFile(__dirname + '/public/login.html')
])

// BIENVENIDO
servidor.get('/cambiar', [
    (peticion, respuesta) => respuesta.sendFile(__dirname + '/public/cambiar.html')
])

/*
    RUTAS PROTEGIDAS
*/

// GPS
servidor.get('/gps', [comprobar_login,
    (peticion, respuesta) => respuesta.sendFile(__dirname + '/public/gps.html')
])

// GPS
servidor.get('/gps2', [comprobar_login,
    (peticion, respuesta) => respuesta.sendFile(__dirname + '/public/gps2.html')
])

// CONTACTO
servidor.get('/contacto', [comprobar_login,
    (peticion, respuesta) => respuesta.sendFile(__dirname + '/public/Contacto.html')
])

// EDITAR PERFIL
servidor.get('/editar', [comprobar_login,
    (peticion, respuesta) => respuesta.sendFile(__dirname + '/public/MiPerfil.html')
])
// EDITAR PERFIL
servidor.get('/faq', [comprobar_login,
    (peticion, respuesta) => respuesta.sendFile(__dirname + '/public/faq.html')
])

/*
    Función para comprobar el login

    Si la cookie no está presente o es incorrecta se envia el formulario de acceso.
    En caso contrario se continua el proceso de la petición llamando a siguiente()
*/

function comprobar_login(peticion, respuesta, siguiente)
{
    if ('usuario' in peticion.cookies && 'contrasenya' in peticion.cookies) {
    base_datos.get('SELECT * FROM usuarios WHERE nombre = ? AND contrasenya = ?',
            [ peticion.cookies.usuario, peticion.cookies.contrasenya ],
                (error, fila) => {
                    if (error != null)
                        respuesta.sendStatus(500)
                    else if (fila === undefined)
                        respuesta.sendFile(__dirname + '/public/login.html')
                    else siguiente()
                }
        )
    } else {
        respuesta.sendFile(__dirname + '/public/login.html')
    }
}

/*
    Peticiones del API REST

    Primero se realiza la consulta a la base de datos tomando los parámetros
    necesarios de la petición. Luego se construye un JSON con los datos y se
    envía al cliente como respuesta. Si la consulta falla se envia un código
    de error.
*/



servidor.get('/login', (peticion, respuesta) => {
    base_datos.get('SELECT * FROM usuarios WHERE nombre = ? AND contrasenya = ?',
        [ peticion.query.usuario, peticion.query.contrasenya ],
            (error, fila) => {
                if (fila === undefined) {
                    respuesta.sendStatus(401)
                } else {
                    respuesta.json(fila)
                }
        })
})

servidor.get('/sensores', [comprobar_login, (peticion, respuesta) => {
    base_datos.all('SELECT * FROM sensores WHERE usuario = ?',
        [ peticion.cookies.usuario],
            (error, fila) => {
                if (error != null) respuesta.sendStatus(500)
                else respuesta.json(fila)
            })
}])

servidor.get('/medidas', [comprobar_login, (peticion, respuesta) => {
    base_datos.all('SELECT * FROM medidas WHERE mac = ?',
        [ peticion.query.mac],
            (error, fila) => {
                if (error != null) respuesta.sendStatus(500)
                else respuesta.json(fila)
            })
}])



servidor.post("/cambiarContra", (peticion, respuesta) => {
  console.log(peticion.body.usuario)
    console.log(peticion.body.contrasenya1)


    base_datos.run("UPDATE usuarios SET contrasenya=$contra WHERE nombre=$nombre",
    {
      $contra: peticion.body.contrasenya1,
      $nombre: peticion.body.usuario
    },
            (error, fila) => {
                if (!error) {
                  respuesta.sendFile(__dirname + '/public/login.html')
                } else {
                  respuesta.sendStatus(404)
                }
        })

});

servidor.post("/editarm", (peticion, respuesta) => {
  console.log(peticion.body.nombre)
    console.log(peticion.body.contrasenya1)
    console.log(peticion.body.apellido)
      console.log(peticion.body.email)


    base_datos.run("UPDATE usuarios SET contrasenya=$contra, apellido=$ape, email=$email WHERE nombre=$nombre",
    {
      $contra: peticion.body.contrasenya1,
      $nombre: peticion.body.nombre,
      $ape: peticion.body.apellido,
      $email: peticion.body.email
    },
            (error, fila) => {
                if (!error) {
                  respuesta.sendFile(__dirname + '/public/MiPerfil.html')
                } else {
                  respuesta.sendStatus(404)
                }
        })

});
