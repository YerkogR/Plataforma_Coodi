# Plataforma_Coodi

## Descripción

Este repositorio contiene el código de la Plataforma Web Coodi.

## Uso

Para utilizar la plataforma web, debe tener instalado Node.js, Arduino IDE y Arduino CLI, ya que la plataforma requiere de esto para poder funcionar.

En adición, se debe tener instaladas las siguientes librerías en Arduino CLI:
- Servo
- Ultrasonic
- Adafruit NeoPixel

Para la instalación de estas librerías, se debe ejecutar el comando

```bash
arduino-cli lib install 'Nombre_librería'
``` 

Si ya posee esto, debe abrir la consola de comando y escribir los siguientes comandos:

```bash
cd 'Ruta_de_la_carpeta'

npm start
``` 

Con el código anterior, se posicionará en la carpeta de la plataforma Coodi y con el comando "npm start" iniciará el servidor de la plataforma en el puerto 4000.

Nota: Se usó "nodemon" para la actualización de la plataforma de forma automática, cada vez que se guardaba un cambio en el código.

## Cambios en la plataforma

Para realizar cambios en la plataforma se debe tener en cuenta que:

- Dentro de la carpeta "server" se encuentra el archivo "server.js" que contiene la configuración del servidor.
- Dentro de la carpeta "server", se encuentra además la carpeta "Public", dentro de esta se encuentran el script de la plataforma, que conecta el servidor con el HTML, los estilos CSS, los códigos de Arduino que se generen y la librería "Blockly".
- Dentro de la librería "Blockly" se encuentran los bloques, tanto de Arduino como los entregados por "Blockly" y el archivo de arduino_compressed que contiene la traducción de los bloques a Arduino.
- Para la modificación o creación de algún bloque de Arduino, se debe realizar en los archivos blocks_compressed.js y blockly_compressed.js, además de modificar el archivo arduino_compressed.js, ya que en este archivo se encuentra la traducción de los bloques al lenguaje Arduino.

## Contribuciones

Gracias a "BlocklyDuino" por aportar con los bloques de Arduino.