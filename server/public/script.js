/* Este archivo contiene los ajustes las funciones de la Plataforma Web Coodi
Autores: Yerko Gonzalez y Daniel Miranda
 */

// variable que contiene la ToolBox de la plataforma, construyendose asi la caja de categorias de los bloques
var toolboxXML = 
`<xml id="toolbox" style="display: none">
<category name="Lógica">
  <block type="controls_if"></block>
  <block type="logic_compare"></block>
  <block type="logic_operation"></block>
  <block type="logic_negate"></block>
  <block type="logic_null"></block>
</category>
<category name="Control">
  <block type="base_delay">
    <value name="DELAY_TIME">
      <block type="math_number">
        <field name="NUM">1000</field>
      </block>
    </value>
  </block>
  <block type="controls_for">
    <value name="FROM">
      <block type="math_number">
        <field name="NUM">1</field>
      </block>
    </value>
    <value name="TO">
      <block type="math_number">
        <field name="NUM">10</field>
      </block>
    </value>
  </block>
  <block type="controls_whileUntil"></block>
</category>
<category name="Matemáticas">
  <block type="math_number"></block>
  <block type="math_arithmetic"></block>
  <block type="base_map">
    <value name="DMAX">
      <block type="math_number">
        <field name="NUM">180</field>
      </block>
    </value>
  </block>
</category>
<category name="Texto">
  <block type="text"></block>
</category>
<category name="Variables" custom="VARIABLE"></category>
<category name="Funciones" custom="PROCEDURE"></category>
<sep></sep>
<category name="Entrada/Salida">
  <block type="inout_highlow"></block>
  <block type="inout_digital_write"></block>
  <block type="inout_digital_read"></block>
  <block type="inout_analog_write">
    <value name="NUM">
      <block type="math_number">
        <field name="NUM">0</field>
      </block>
    </value>
  </block>
  <block type="inout_analog_read"></block>
</category>
<category name="Mini Servo">
  <block type="servo_move">
    <value name="DEGREE">
      <block type="math_number">
        <field name="NUM">0</field>
      </block>
    </value>
  </block>
  <block type="servo_read_degrees"></block>
</category>
</xml>
`
// variable que contiene la definición de la ToolBox
var workspace = Blockly.inject('blocklyDiv',
  {grid:
      {spacing: 25,
        length: 3,
        colour: '#ccc'},
    media: 'blockly/media/',
    toolbox: toolboxXML,
    trashcan: true,
  });

  // Función que se encarga de la traducción de los bloques al lenguaje Arduino
function tradicorCodigo() {
  var arduinoTextarea = document.getElementById('codigoTraducido');
  arduinoTextarea.value = `#include <Arduino.h>
#include <Wire.h>
#include <SoftwareSerial.h>

` + Blockly.Arduino.workspaceToCode();
}

// Declaramos que por defecto en la plataforma web se muestre la traducción de los bloques
tradicorCodigo();

// Declaramos que cada vez que se agregue un bloque, se actualice la traducción de los bloques
workspace.addChangeListener(function (event) {
  tradicorCodigo()
});

// Función que muestra la ventana emergente que aparece para seleccionar un dispositivo conectado a la plataforma web
function mostrarVentana() {
  fetch('/listPorts')
    .then(response => response.json())
    .then(data => {
      const opcionesSelect = document.getElementById('opciones');
      opcionesSelect.innerHTML = '';
      data.ports.forEach(port => {
        const option = document.createElement('option');
        option.value = port;
        option.text = port;
        opcionesSelect.appendChild(option);
      });
    });

  document.getElementById('ventanaEmergente').style.display = 'block';
}

// Función que oculta la ventana emergente qye aparece para seleccionar un dispositivo
function ocultarVentana() {
    document.getElementById('ventanaEmergente').style.display = 'none';
  }

// Función que se encarga de conectar la placa arduino a la plataforma web
function conectarDispositivo() {
  const opcionesSelect = document.getElementById('opciones');
  const opcionSeleccionada = opcionesSelect.value;
  fetch('/conectarDispositivo', {
    method: "POST",
    body: JSON.stringify({path: opcionSeleccionada}),
    headers: {"Content-type": "application/json; charset=UTF-8"}
  })
  .then(response => response.json()) 
  .then(json => console.log(json));

  revisarConexion();
}

// Función que se encarga de tomar los valores de las variabels booleanas que entrega el servidor.
function revisarConexion() {
  var botonSeleccionar = document.getElementById('seleccionarDispositivo');
  
  fetch('/coodiDatos')
    .then(response => response.json())
    .then(data => {
      if(data["conexion_conectado"] == true && data["conexion_desconectado"] == false){
        document.getElementById('ventanaEmergente').style.display = 'none';

        window.alert("Dispositivo vinculado correctamente");
        
        botonSeleccionar.style.display = 'none';
        document.getElementById('subir_desconectar').style.display = 'flex';
      }
      if (data["conexion_conectado"] == false && data["conexion_desconectado"] == false){
        document.getElementById('ventanaEmergente').style.display = 'none';
        
        window.alert("Error al vincular el dispositivo");
      }

      if(data["conexion_conectado"] == false && data["conexion_desconectado"] == true){
        
        window.alert("Dispositivo desconectado correctamente");

        botonSeleccionar.style.display = 'block';
        document.getElementById('subir_desconectar').style.display = 'none';
      }
    });
}

// Función que se encarga de comprobar la subida del código a la placa de arduino uno
function verificarSubidaCodigo() {
  return new Promise((resolve, reject) => {
    fetch('/coodiDatos')
      .then(response => response.json())
      .then(data => {
        const variableDeseada = data["codgio_cargado"];
        resolve(variableDeseada);
      })
      .catch(error => {
        console.error(error);
        reject(error);
      });
  });
}

// Función bucle que revisa que la subida del código a la placa arduino se ha realizado
function buclePeticionSubirCodigo() {
  return new Promise(async (resolve) => {
    let variableDeseada = false;

    while (!variableDeseada) {
      variableDeseada = await verificarSubidaCodigo();

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    resolve(variableDeseada);
  });
}

// Función que se ejecuta al presionar el botón "Subir Código", subiendo el código a la placa arduino
function cargarCodigo() {
  
  var button = document.getElementById("subirBloques");
  button.disabled = true;
  var codigoBloques = 
  `#include <Arduino.h>
#include <Wire.h>
#include <SoftwareSerial.h>
`;
  codigoBloques = codigoBloques + Blockly.Arduino.workspaceToCode();
  fetch('/cargarCodigo', {
    method: "POST",
    body: JSON.stringify({codigo: codigoBloques}),
    headers: {"Content-type": "application/json; charset=UTF-8"}
  })
  .then(response => response.json()) 
  .then(json => console.log(json));  
  
  buclePeticionSubirCodigo()
  .then(result => {
    console.log('La variable deseada es true:', result);
    window.alert("El código se ha subido exitosamente");
    button.disabled = false;
  })
  .catch(error => {
    console.error('Error:', error);
    window.alert("Error al cargar el código");
  });
  
}

// Función que se encarga de desconectar la placa arduino de la plataforma
function desconectarDispositivo() {
  const desconectar = true;
  fetch('/desconectarDispositivo', {
    method: "POST",
    body: JSON.stringify({descDispositivo: desconectar}),
    headers: {"Content-type": "application/json; charset=UTF-8"}
  })
  .then(response => response.json()) 
  .then(json => console.log(json));
  revisarConexion();
}