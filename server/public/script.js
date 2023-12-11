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

var workspace = Blockly.inject('blocklyDiv',
  {grid:
      {spacing: 25,
        length: 3,
        colour: '#ccc'},
    media: 'blockly/media/',
    toolbox: toolboxXML,
    trashcan: true,
  });

function tradicorCodigo() {
  var arduinoTextarea = document.getElementById('codigoTraducido');
  arduinoTextarea.value = `#include <Arduino.h>
#include <Wire.h>
#include <SoftwareSerial.h>

` + Blockly.Arduino.workspaceToCode();
}

tradicorCodigo();

workspace.addChangeListener(function (event) {
  tradicorCodigo()
});
      
function mostrarVentana() {
  // Realiza una solicitud AJAX para obtener la lista de puertos
  fetch('/listPorts')
    .then(response => response.json())
    .then(data => {
      const opcionesSelect = document.getElementById('opciones');
      opcionesSelect.innerHTML = ''; // Limpiar opciones anteriores
      data.ports.forEach(port => {
        const option = document.createElement('option');
        option.value = port;
        option.text = port;
        opcionesSelect.appendChild(option);
      });
    });

  document.getElementById('ventanaEmergente').style.display = 'block';
}
  
function ocultarVentana() {
    document.getElementById('ventanaEmergente').style.display = 'none';
  }
  
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