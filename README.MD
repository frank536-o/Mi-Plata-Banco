# MI PLATA - BANCO FINANCIERO

**Integrantes:**
* Frankin Ochoa Henao
* Tania Valentina Osorio Cárdenas

**Programa:** Técnico laboral como asistente en desarrollo de software  
**Institución:** CESDE  
**Fecha:** 13/10/2026  

---

## RESUMEN EJECUTIVO

### Breve descripción del proyecto
El proyecto **Mi Plata Banco** consiste en el desarrollo de una aplicación web funcional mediante JavaScript, diseñada para simular el comportamiento de un sistema bancario moderno. La plataforma permite la gestión de usuarios y la administración de múltiples productos financieros como cuentas de ahorro, cuentas corrientes y tarjetas de crédito.

### Objetivos principales
Desarrollar una solución de software aplicando el paradigma de Programación Orientada a Objetos (POO) en JavaScript, asegurando la correcta implementación de reglas de negocio financieras y mecanismos de seguridad como la autenticación de usuarios.

### Resultados esperados
Se espera obtener un simulador bancario intuitivo y seguro que realice validaciones en tiempo real y permita a los usuarios registrarse, autenticarse, consultar saldos y realizar transacciones sin inconsistencias de datos.

---

## INTRODUCCIÓN

### Contexto del proyecto
En la actualidad, las plataformas de banca virtual son herramientas fundamentales para la gestión financiera. Este proyecto busca emular las operaciones y validaciones clave que ocurren en el entorno transaccional diario de una entidad bancaria.

### Justificación
El desarrollo de esta aplicación permite aplicar de forma práctica los conceptos avanzados de desarrollo web frontend, específicamente el uso estructurado de JavaScript para la lógica de negocios y manipulación dinámica de la interfaz.

### Alcance general
El sistema abarca desde la creación y gestión de perfiles de cliente hasta la ejecución de reglas de negocio para tres tipos de cuentas específicas, incluyendo bloqueos por seguridad tras intentos fallidos de inicio de sesión.

### Repositorio
`git@github.com:frank536-o/Mi-Plata-Banco.git`

---

## PROPÓSITO DEL SOFTWARE

* **Objetivo del desarrollo:** Crear una interfaz transaccional que valide y aplique las condiciones financieras del mundo real.
* **Público objetivo:** El software está orientado tanto a usuarios administradores encargados de la gestión operativa del banco, como a clientes finales que desean visualizar y manipular sus fondos virtuales.
* **Impacto esperado:** Proveer una experiencia de usuario fluida y coherente visualmente, garantizando que cada transacción actualice los saldos y se registre correctamente.

---

## PROBLEMAS A RESOLVER

### Situación actual
En desarrollo web enfrentamos el reto de conectar una interfaz visual con lógicas matemáticas e interacciones de seguridad, con la interacción del usuario para poder hacer las diferentes transacciones.

### Necesidades detectadas
Existe la necesidad de un simulador local que evalúe correctamente cuándo aprobar o rechazar una transacción basada en topes y cómo recalcular saldos en tiempo real sin recargar la página.

---

## SOLUCIÓN PROPUESTA

* **Descripción de la solución:** Se implementará una Single Page Application donde, dependiendo del rol (Administrador o Cliente), se desplegarán paneles diferentes.
* **Beneficios:**
  * Seguridad integrada con bloqueos al tercer intento fallido de login.
  * Cálculos automatizados de tasas de interés.
* **Innovación:** La aplicación consolida la abstracción de objetos financieros en el frontend, usando herencia y polimorfismo.

---

## TECNOLOGÍAS A UTILIZAR

### Lenguajes de programación
* **JavaScript:** Lógica de programación y manipulación del DOM.
* **HTML5:** Estructura de las vistas.
* **CSS3:** Estilos y diseño responsivo.

### Frameworks y herramientas
* Git & GitHub (Control de versiones)
* Figma (Diseño UI/UX)
* VS Code (Editor de código)
* Gemini AI (Asistencia en desarrollo)

---

## DISEÑO DEL SISTEMA

### Historias de Usuarios

#### HU-01 · Registro de Nuevo Cliente
* **Como:** Usuario nuevo.
* **Quiero:** Diligenciar un formulario con mi número de identificación, nombre completo, número de celular, usuario y contraseña.
* **Para:** Registrarme en el sistema bancario "Mi Plata" y acceder a sus servicios.
* **Criterios de aceptación:**
  1. El sistema debe solicitar todos los datos obligatorios, incluyendo una confirmación de la contraseña ingresada.
  2. El sistema debe validar que el nombre de usuario sea único y no exista en los registros previos.
  3. El diseño del formulario debe mantener la coherencia visual con la página de inicio.

#### HU-02 · Autenticación y Seguridad (Bloqueo de cuenta)
* **Como:** Cliente del banco.
* **Quiero:** Iniciar sesión con mi usuario y contraseña, visualizando la cantidad de intentos restantes.
* **Para:** Acceder de forma segura a mi panel de transacciones bancarias.
* **Criterios de aceptación:**
  1. El sistema debe validar las credenciales contra la base de datos de usuarios.
  2. El sistema debe mostrar un contador de intentos de sesión visible en la pantalla.
  3. Al tercer intento fallido, el sistema debe bloquear la cuenta inmediatamente y mostrar un mensaje informativo claro al usuario.

#### HU-03 · Gestión y Administración de Usuarios (CRUD)
* **Como:** Administrador del sistema.
* **Quiero:** Acceder a una interfaz que me permita agregar, editar y eliminar usuarios del sistema.
* **Para:** Mantener el control operativo sobre los clientes registrados en el banco.
* **Criterios de aceptación:**
  1. El sistema debe permitir el registro de nuevos usuarios desde el panel administrativo.
  2. El sistema debe permitir modificar los datos existentes de cualquier usuario registrado.
  3. Al intentar eliminar un usuario, el sistema debe exigir obligatoriamente una confirmación antes de borrar el registro.

#### HU-04 · Retiro con Cálculo de Intereses (Cuenta de Ahorros)
* **Como:** Cliente con Cuenta de Ahorros.
* **Quiero:** Retirar dinero de mi cuenta aplicando las reglas de rendimiento del banco.
* **Para:** Disponer de mi dinero en efectivo.
* **Criterios de aceptación:**
  1. El sistema debe validar que el monto solicitado no supere el saldo disponible en la cuenta.
  2. En el momento exacto del retiro, el sistema debe calcular y aplicar una tasa de interés mensual del 1.5%.
  3. El sistema debe actualizar el saldo y registrar el movimiento de retiro.

#### HU-05 · Retiro con Sobregiro (Cuenta Corriente)
* **Como:** Cliente con Cuenta Corriente.
* **Quiero:** Realizar un retiro de dinero utilizando mi beneficio de sobregiro.
* **Para:** Obtener fondos incluso si mi retiro supera mi saldo base.
* **Criterios de aceptación:**
  1. El sistema debe calcular el límite de retiro permitiendo hasta un 20% adicional sobre el saldo actual del cliente.
  2. El sistema no debe cobrar intereses por este retiro, ya que la cuenta corriente no los genera.
  3. El sistema debe actualizar el saldo en la cuenta y guardar el registro del movimiento.

#### HU-06 · Compras y Financiación con Tarjeta de Crédito
* **Como:** Cliente con Tarjeta de Crédito.
* **Quiero:** Realizar compras seleccionando el número de cuotas de financiación.
* **Para:** Pagar mis compras a plazos conociendo el valor exacto de mi cuota mensual.
* **Criterios de aceptación:**
  1. El sistema debe aplicar 0% de interés si la compra es a 1 o 2 cuotas.
  2. El sistema debe aplicar un 1.9% de interés mensual para compras entre 3 y 6 cuotas, y un 2.3% para compras a 7 cuotas o más.
  3. Antes de confirmar la transacción, el sistema debe calcular (usando la fórmula de amortización) y mostrar en pantalla el valor exacto del pago mensual resultante.

#### HU-07 · Transferencias de Dinero
* **Como:** Cliente del banco.
* **Quiero:** Transferir dinero desde mi cuenta hacia otros productos.
* **Para:** Mover mis fondos entre mis propias cuentas o enviar dinero a terceros.
* **Criterios de aceptación:**
  1. El sistema debe permitir elegir si la transferencia es a un producto propio o a la cuenta de otro usuario.
  2. El sistema debe bloquear la operación si el producto de origen y el producto de destino seleccionados son exactamente el mismo.
  3. Al confirmar, el sistema debe debitar el dinero de la cuenta de origen, acreditarlo en la cuenta destino y registrar ambos movimientos.

#### HU-08 · Edición de Perfil y Cambio de Contraseña
* **Como:** Cliente del banco.
* **Quiero:** Editar mi información personal y cambiar mi contraseña desde mi perfil.
* **Para:** Mantener mis datos actualizados y mi cuenta segura.
* **Criterios de aceptación:**
  1. El sistema debe permitir modificar y guardar los datos ingresados en el registro (nombre, celular, etc.).
  2. Para cambiar la contraseña, el sistema debe solicitar la clave actual, la nueva clave y una confirmación de la nueva clave.
  3. El sistema debe validar que la clave actual sea correcta antes de guardar la nueva contraseña y mostrar un mensaje de éxito al finalizar.

#### HU-09 · Consignación, Consulta de Saldo y Movimientos
* **Como:** Cliente del banco.
* **Quiero:** Consignar dinero en mi cuenta, ver mi saldo actual y revisar mi historial.
* **Para:** Tener control total sobre los ingresos y egresos de mi dinero.
* **Criterios de aceptación:**
  1. Para las consignaciones, el sistema debe validar obligatoriamente que el monto ingresado sea un número positivo mayor a cero.
  2. El historial de movimientos debe mostrar la fecha, hora, tipo de transacción y valor, ordenado de la fecha más reciente a la más antigua.
  3. El saldo actualizado debe mostrarse claramente en el panel tras cualquier operación exitosa.

---

## DIAGRAMAS DEL PROYECTO

### Diagrama de Clase UML

## CRONOGRAMA DE TRABAJO

| Fase | Actividades Principales | Fecha Inicio | Fecha Fin | Responsable |
| :--- | :--- | :---: | :---: | :--- |
| **1. Planificación** | Definición de requerimientos y diseño UML | 29/08/2026 | 05/09/2026 | Equipo Integrador |
| **2. Maquetación** | Diseño UI/UX con HTML5 y CSS3 | 05/09/2026 | 19/09/2026 | Tania Osorio |
| **3. Desarrollo Frontend** | Lógica POO JavaScript y estructura DOM | 19/09/2026 | 03/10/2026 | Frankin Ochoa |
| **4. Pruebas y Ajustes** | Validaciones de página y prueba/error | 03/10/2026 | 12/10/2026 | Equipo Integrador |
| **5. Entrega Final** | Documentación final y despliegue | 13/10/2026 | 13/10/2026 | Equipo Integrador |

---

## CONCLUSIONES

### Reflexión final
El desarrollo del simulador para **Mi Plata Banco** demostró la importancia de estructurar correctamente la lógica del negocio antes de codificar la interfaz visual. Aplicar la Programación Orientada a Objetos facilita la escalabilidad de los productos financieros.

### Aprendizajes
* Implementación efectiva de diagramas UML.
* Importancia de la manipulación dinámica del DOM.
* Creación de objetos e implementación de Herencia y Polimorfismo.
* Cálculo algorítmico de finanzas y su reflejo en la interfaz gráfica.

### Recomendaciones
Para versiones futuras, se recomienda conectar el frontend con un backend real (Node.js/Express) e implementar una base de datos persistente (PostgreSQL o MongoDB).