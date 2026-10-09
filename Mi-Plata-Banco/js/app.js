// ==========================================
// 1. GESTIÓN DE DATOS Y PERSISTENCIA (LOCALSTORAGE)
// ==========================================

// Guardar el cliente activo en LocalStorage para no perder los datos al recargar
function guardarClienteEnStorage(cliente) {
    localStorage.setItem('clienteActivo', JSON.stringify(cliente));
}

// Cargar el cliente guardado o usar a Juan Perez como respaldo inicial
function cargarClienteDeStorage() {
    const datosGuardados = localStorage.getItem('clienteActivo');
    if (datosGuardados) {
        const d = JSON.parse(datosGuardados);
        return new Cliente(d.nombreCompleto, d.cedula, d.nombreUsuario, d.clave, d.telefono);
    }
    // Cliente por defecto si la memoria está vacía
    return new Cliente("Juan Perez", "1020304050", "juanperez", "1234", "3001234567");
}

// Inicializamos el cliente activo
const cliente1 = cargarClienteDeStorage();

// Inicializamos los tres productos financieros
let miCuentaAhorros = new CuentaAhorros("AH-001", 100000, cliente1);
let miCuentaCorriente = new CuentaCorriente("CC-001", 200000, cliente1);
let miTarjetaCredito = new TarjetaCredito("TC-001", 1500000, cliente1);

let cuentaActual = miCuentaAhorros;


// ==========================================
// 2. CAPTURA DE ELEMENTOS DEL DOM
// ==========================================

// Elementos del Cajero Web (cajero.html)
const elNombreCliente = document.getElementById("nombreCliente");
const elSaldoActual = document.getElementById("saldoActual");
const elListaMovimientos = document.getElementById("listaMovimientos");
const elSelectorCuenta = document.getElementById("selectorCuenta");

// Formulario de transacciones en el cajero
const formOperacion = document.getElementById("formOperacion");
const selectTipoOperacion = document.getElementById("tipoOperacion");
const inputMonto = document.getElementById("montoOperacion");
const grupoCuotas = document.getElementById("grupoCuotas");
const inputCuotas = document.getElementById("numeroCuotas");
const btnCerrarSesion = document.getElementById("btn-cerrar-sesion");

// Elementos de la Landing Page (index.html)
const btnRegistrar = document.getElementById("btn-registrarse");
const btnIniciarSesion = document.getElementById("btn-iniciar-sesion");
const btnAccederCajero = document.getElementById("btn-acceder-cajero");

const modalRegistro = document.getElementById("modal-registro");
const btnCerrarModal = document.getElementById("btn-cerrar-modal");
const formRegistro = document.getElementById("form-registro");

const modalLogin = document.getElementById("modal-login");
const btnCerrarLogin = document.getElementById("btn-cerrar-login");
const formLogin = document.getElementById("form-login");


// ==========================================
// 3. FUNCIÓN PARA REFLEJAR DATOS EN PANTALLA
// ==========================================

function actualizarPantalla() {
    // Si no estamos en cajero.html, se detiene para evitar errores en la consola
    if (!elNombreCliente) return;

    elNombreCliente.textContent = `Titular: ${cuentaActual.titular.nombreCompleto}`;
    
    const formateador = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0
    });

    if (cuentaActual instanceof TarjetaCredito) {
        const cupoDisponible = cuentaActual.cupoCredito - cuentaActual.saldoUtilizado;
        elSaldoActual.textContent = `Deuda: ${formateador.format(cuentaActual.saldoUtilizado)} | Cupo Disp: ${formateador.format(cupoDisponible)}`;
    } else {
        elSaldoActual.textContent = `Saldo Disponible: ${formateador.format(cuentaActual.consultarSaldo())}`;
    }

    elListaMovimientos.innerHTML = "";

    if (cuentaActual.historialDeMovimientos.length === 0) {
        elListaMovimientos.innerHTML = "<li>No hay movimientos registrados.</li>";
    } else {
        cuentaActual.historialDeMovimientos.forEach(mov => {
            const li = document.createElement("li");
            li.textContent = mov.obtenerDetalle();
            elListaMovimientos.appendChild(li);
        });
    }
}


// ==========================================
// 4. LÓGICA DE INICIAR SESIÓN (INDEX.HTML)
// ==========================================

if (btnIniciarSesion && modalLogin) {
    btnIniciarSesion.addEventListener("click", (e) => {
        e.preventDefault();
        modalLogin.style.display = "flex";
    });
}

if (btnAccederCajero && modalLogin) {
    btnAccederCajero.addEventListener("click", (e) => {
        e.preventDefault();
        modalLogin.style.display = "flex";
    });
}

if (btnCerrarLogin && modalLogin) {
    btnCerrarLogin.addEventListener("click", () => {
        modalLogin.style.display = "none";
    });
}

// Procesar el ingreso
if (formLogin) {
    formLogin.addEventListener("submit", (e) => {
        e.preventDefault();

        const usuarioIngresado = document.getElementById("login-usuario").value;
        const claveIngresada = document.getElementById("login-clave").value;

        // Validar credenciales con el cliente guardado en memoria
        if (usuarioIngresado === cliente1.nombreUsuario && claveIngresada === cliente1.clave) {
            alert(`¡Bienvenido de nuevo, ${cliente1.nombreCompleto}!`);
            formLogin.reset();
            modalLogin.style.display = "none";
            
            // Redirección a la sucursal virtual
            window.location.href = "cajero.html";
        } else {
            alert("Usuario o contraseña incorrectos. Intente de nuevo.");
        }
    });
}


// ==========================================
// 5. LÓGICA DE REGISTRO (INDEX.HTML)
// ==========================================

if (btnRegistrar && modalRegistro) {
    btnRegistrar.addEventListener("click", (e) => {
        e.preventDefault();
        modalRegistro.style.display = "flex";
    });
}

if (btnCerrarModal && modalRegistro) {
    btnCerrarModal.addEventListener("click", () => {
        modalRegistro.style.display = "none";
    });
}

if (formRegistro) {
    formRegistro.addEventListener("submit", (e) => {
        e.preventDefault();

        const nombre = document.getElementById("reg-nombre").value;
        const cedula = document.getElementById("reg-cedula").value;
        const usuario = document.getElementById("reg-usuario").value;
        const clave = document.getElementById("reg-clave").value;
        const telefono = document.getElementById("reg-telefono").value;

        // Crear instancia POO
        const nuevoCliente = new Cliente(nombre, cedula, usuario, clave, telefono);

        // Guardar de forma permanente en el navegador
        guardarClienteEnStorage(nuevoCliente);

        alert(`¡Bienvenido a Mi Plata, ${nuevoCliente.nombreCompleto}! Tu cuenta ha sido registrada.`);
        formRegistro.reset();
        
        // Redireccionar al cajero con el nuevo usuario
        window.location.href = "cajero.html";
    });
}


// ==========================================
// 6. LÓGICA DENTRO DEL CAJERO (CAJERO.HTML)
// ==========================================

// Cambiar de producto financiero en el selector
if (elSelectorCuenta) {
    elSelectorCuenta.addEventListener("change", (e) => {
        const opcion = e.target.value;
        if (opcion === "ahorros") cuentaActual = miCuentaAhorros;
        if (opcion === "corriente") cuentaActual = miCuentaCorriente;
        if (opcion === "tarjeta") cuentaActual = miTarjetaCredito;
        
        actualizarPantalla();
    });
}

// Botón para cerrar sesión
if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener("click", () => {
        alert("Sesión cerrada correctamente.");
        window.location.href = "index.html";
    });
}

// Inicialización en cajero.html
actualizarPantalla();