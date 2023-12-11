# Plataforma_Coodi

## Descripción

Este repositorio contiene el código de la Plataforma Web Coodi

## Uso

Para utilizar la plataforma web, debe tener instalado Node.js, Arduino IDE e Arduino CLI, ya que la plataforma requeiere de esto para poder funcionar.

Si ya posee esto, debe abrir la consola de comando y escribir los siguientes comandos:

```bash
cd Ruta_de_la_carpeta

npm start
``` 

Con el codigo anterior, se posicionara en la carpeta de la plataforma Coodi y con el comando "npm start" iniciara el servidor de la plataforma en el puerto 4000.

## Cambios en la plataforma

Para realizar cambios en la plataforma se debe tener en cuenta que:

- Dentro de la carpeta "server" se encuentran el archivo "server.js" que contiene la configuración del servidor
- Dentro de la carpeta "server", se encuentra ademas la carpeta "Public", dentro de esta se encuentran el script de la plataforma, que conecta el servidor con el HTML, los estilos CSS, los códigos de arduino que se generén y la libreria "Blockly".
- Dentro de la librería "Blockly" se encuentran los bloques, tanto de arduino como los entregados por "Blockly" y el archivo de arduino que contiene la traducción de los bloques a arduino.

## Contrubuciones

Gracias a "BlocklyDuino" por aportar con los bloques de Arduino.