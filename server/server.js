/* Este archivo contiene los ajustes del servidor de la Plataforma Web Coodi
Autores: Yerko Gonzalez y Daniel Miranda
 */

// Declaración de constantes.
const { SerialPort } = require('serialport')
const { exec } = require('child_process');
const fs = require('fs');

const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const { error } = require('console');

const app= express();
const servidor = http.createServer(app);
const port_server = 4000;

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

// Declaración de Variables
var conectado = false;
var desconectado = false;
var codigoSubido = false;
var errorSubido = false;
var opcionSeleccionada;

let serialport;

servidor.listen(port_server, () => {
    console.log('Servidor corriendo en puerto ', port_server);
});

// Función encargada de guardar el archivo .ino en la carpeta "codigos_arduino".
function guardarCodigoEnArchivo(codigo, nombreArchivo, carpeta) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(carpeta)) {
      fs.mkdirSync(carpeta, { recursive: true });
    }
    var ruta_codigo = carpeta+'/'+nombreArchivo
    fs.writeFile(ruta_codigo, codigo, 'utf8', (error) => {
      if (error) {
        reject(error);
      } else {
        console.log('Archivo guardado exitosamente');
        resolve();
      }
    });
  });
}

// Función encargada de subir el código generado en la plataforma, a la placa arduino mediante el comando "arduino-cli compile -b arduino:avr:uno -upload"
// que entrega Arduino CLI.
function subirCodigo(rutaArchivo, pathSeleccionado) {
  const comando = `arduino-cli compile -b arduino:avr:uno -upload -p ${pathSeleccionado} ${rutaArchivo}`;
  return new Promise((resolve, reject) => {
    exec(comando, (error, stdout, stderr) => {
      let subir = false;
      let conectar = false;
      let desconectar = false;

      if (error) {
        reject(error);
      } else {
        console.log(stdout);   
        serialport = new SerialPort({path: opcionSeleccionada, baudRate: 9600});
        serialport.on('open', function () {
          console.log('Hemos vuelto a escuchar a Coodi')
      });
      conectar = true;
      desconectar = false;
      subir = true;
      }
      resolve({ subir, conectar, desconectar, error });
    });
  });
}

// Escuchamos los puertos conectados.
app.get('/listPorts', (req, res) => {
    SerialPort.list().then(function (ports) {
      const portNames = ports.map((port) => port.path);
      res.json({ ports: portNames });
    });
  }); 

  // Enviamos el dispositivo que queremos conectar
app.post('/conectarDispositivo', (req, res) => {
  if (req.body['path'] != '') {
    opcionSeleccionada = req.body['path'];
    res.json({ mensaje: 'Dispositivo recibido correctamente' });
    console.log("Opcion seleccionada: ", opcionSeleccionada);

    serialport = new SerialPort({path: opcionSeleccionada, baudRate: 9600});

    serialport.on('open', function () {
        console.log('Escuchando a Coodi')
        conectado = true;
        desconectado = false;
    });

    serialport.on('close', function () {
      console.log('Dispositivo desconectado')
    });
      
    serialport.on('err', function () {
          console.log(err.message)
    });
  } else{
    res.json({ mensaje: 'No se ha conectado ningun dispositivo' });
    res.status(400).json({ error: 'Datos no válidos en la solicitud' });
    conectado = false;
  }
});

// Enviamos el código que se desea cargar en la placa arduino.
app.post('/cargarCodigo', (req, res) => {
  codigoSubido = false;
  var codigoRecibido = req.body['codigo'];
  if (conectado == true && desconectado == false){
    guardarCodigoEnArchivo(codigoRecibido, 'codigo_arduino.ino', "server/public/codigos_arduino/codigo_arduino");
    var ruta_codigo = `.\\server\\public\\codigos_arduino\\codigo_arduino`;
    serialport.close();
    subirCodigo(ruta_codigo, opcionSeleccionada)
    .then((result) => {
      console.log(result.subir)
      
      codigoSubido = result.subir;
      error_cargado = result.error
    })
  }
});

// Enviamos el dispositivo que deseamos desconectar.
app.post('/desconectarDispositivo', (req, res) => {
  var desconectar = req.body['descDispositivo'];
  if (desconectar == true && conectado == true){
    serialport.close((err) => {
      if (err) {
        console.error('Error al cerrar el puerto serie:', err.message);
      }else{
        res.json({ mensaje: 'Dispositivo desconectado correctamente' });
        console.log("Dispositivo desconectado");
        conectado = false;
        desconectado = true;
      }
    });
  } else {
    console.log('No se ha podido desconectar el dispositivo');
  }
});

// Escuchamos las variables que declaramos anteriormente para poder realizar funciones en la plataforma web.
app.get('/coodiDatos', (req, res) => {
  res.json({conexion_conectado : conectado, conexion_desconectado : desconectado, codgio_cargado : codigoSubido, error_cargado : errorSubido})
});