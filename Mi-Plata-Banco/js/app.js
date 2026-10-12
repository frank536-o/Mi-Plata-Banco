// ==========================================
// 1. GESTIÓN DE DATOS Y PERSISTENCIA (LOCALSTORAGE)
// ==========================================

// Guardar cliente registrado
function guardarClienteEnStorage(cliente) {
    localStorage.setItem('clienteRegistrado', JSON.stringify(cliente));
}

// Cargar cliente guardado
function cargarClienteDeStorage() {
    const datos = localStorage.getItem('clienteRegistrado');
    if (datos) {
        try {
            return JSON.parse(datos);
        } catch (e) {
            console.error("Error leyendo cliente del storage:", e);
        }
    }
    return null;
}

// Sesión Activa
function guardarSesionActiva(cliente) {
    localStorage.setItem('sesionActiva', JSON.stringify(cliente));
}

function cargarSesionActiva() {
    const datos = localStorage.getItem('sesionActiva');
    if (datos) {
        try {
            const d = JSON.parse(datos);
            const nombre = d.nombreCompleto || d.nombre || "Usuario";
            const cedula = d.cedula || "000";
            const user = d.nombreUsuario || d.usuario || "user";
            const pass = d.clave || d.password || "123";
            const tel = d.telefono || "000";
            return new Cliente(nombre, cedula, user, pass, tel);
        } catch (e) {
            console.error("Error cargando sesión:", e);
        }
    }
    return new Cliente("Juan Perez", "1020304050", "juanperez", "1234", "3001234567");
}

// Inicializar cliente y cuentas
const clienteActualSesion = cargarSesionActiva();
let miCuentaAhorros = new CuentaAhorros("AH-001", 0, clienteActualSesion);
let miCuentaCorriente = new CuentaCorriente("CC-001", 0, clienteActualSesion);
let miTarjetaCredito = new TarjetaCredito("TC-001", 1500000, clienteActualSesion);

let cuentaActual = miCuentaAhorros;


// ==========================================
// 2. ELEMENTOS DEL DOM
// ==========================================

const elNombreCliente = document.getElementById("nombreCliente");
const elSaldoActual = document.getElementById("saldoActual");
const elListaMovimientos = document.getElementById("listaMovimientos");
const elSelectorCuenta = document.getElementById("selectorCuenta");

const formOperacion = document.getElementById("formOperacion");
const selectTipoOperacion = document.getElementById("tipoOperacion");
const inputMonto = document.getElementById("montoOperacion");
const grupoCuotas = document.getElementById("grupoCuotas");
const btnCerrarSesion = document.getElementById("btn-cerrar-sesion");

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
// 3. ACTUALIZAR PANTALLA EN CAJERO.HTML
// ==========================================

function actualizarPantalla() {
    if (!elNombreCliente) return;

    elNombreCliente.textContent = `Titular: ${cuentaActual.titular.nombreCompleto || cuentaActual.titular.nombre}`;
    
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

// INGRESO Y VALIDACIÓN
if (formLogin) {
    formLogin.addEventListener("submit", (e) => {
        e.preventDefault();

        const userIngresado = document.getElementById("login-usuario").value.trim().toLowerCase();
        const passIngresada = document.getElementById("login-clave").value.trim();
        let listaUsuarios = JSON.parse(localStorage.getItem('listaClientes')) || []; //carga lista completa de clientes registrados
        let usuarioEncontrado = listaUsuarios.find(c => c.nombreUsuario.toLowerCase() === userIngresado);//busca el usuario ingresado en la lista de clientes registrados
        if (!usuarioEncontrado) {
            alert("Usuario no encontrado. Por favor, regístrese primero.");
            return;
        }
        if (usuarioEncontrado.bloqueado) {//verifica si el usuario está bloqueado
            alert("Su cuenta ha sido bloqueada debido a 3 intentos fallidos. Por favor, comuniquese con el banco.");
            return;
        }
        if (usuarioEncontrado.clave === passIngresada) {//valida la contraseña ingresada
            usuarioEncontrado.intentosFallidos = 0;
            localStorage.setItem('listaClientes', JSON.stringify(listaUsuarios));
            alert(`¡Bienvenido de nuevo, ${usuarioEncontrado.nombreCompleto}!`);
            guardarSesionActiva(usuarioEncontrado);
            window.location.href = "cajero.html";// guarda la sesión activa y redirige al cajero
        } else {
            usuarioEncontrado.intentosFallidos = (usuarioEncontrado.intentosFallidos || 0) + 1;//incrementa el contador de intentos fallidos
            if (usuarioEncontrado.intentosFallidos >= 3) {
                usuarioEncontrado.bloqueado = true;
                alert("Ha excedido el número de intentos. Su cuenta ha sido bloqueada por seguridad.");
            }else {
                alert(`Usuario o contraseña incorrectos. Intentos fallidos: ${usuarioEncontrado.intentosFallidos}`);
            }

            localStorage.setItem('listaClientes', JSON.stringify(listaUsuarios));
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

        const nombre = document.getElementById("reg-nombre").value.trim();
        const cedula = document.getElementById("reg-cedula").value.trim();
        const usuario = document.getElementById("reg-usuario").value.trim();
        const clave = document.getElementById("reg-clave").value.trim();
        const telefono = document.getElementById("reg-telefono").value.trim();

        let listaUsuarios = JSON.parse(localStorage.getItem('listaUsuarios')) || [];
        const usuarioDuplicado = listaUsuarios.some(cliente => (cliente.nombreUsuario.toLowerCase() === usuario.toLowerCase() || cliente.cedula === cedula));
        if (usuarioDuplicado) {
            alert("El usuario o la cédula ya están registrados. Por favor, ingrese otro.");
            return;
        }

        const nuevoCliente = {
            nombreCompleto: nombre,
            cedula: cedula,
            nombreUsuario: usuario,
            clave: clave,
            telefono: telefono,
            intentosFallidos: 0,
            bloqueado: false
        };
        listaUsuarios.push(nuevoCliente);
        localStorage.setItem('listaClientes', JSON.stringify(listaUsuarios));
        alert(`¡Registro exitoso, ${nombre}! Ahora inicia sesión con tu usuario.`);
        
        formRegistro.reset();
        modalRegistro.style.display = "none";

        // Abrir login de una vez
        if (modalLogin) {
            modalLogin.style.display = "flex";
            const inputLoginUser = document.getElementById("login-usuario");
            if (inputLoginUser) inputLoginUser.value = usuario;
        }
    });
}


// ==========================================
// 6. OPERACIONES DENTRO DEL CAJERO (CAJERO.HTML)
// ==========================================

if (elSelectorCuenta) {
    elSelectorCuenta.addEventListener("change", (e) => {
        const opcion = e.target.value;
        if (opcion === "ahorros") cuentaActual = miCuentaAhorros;
        if (opcion === "corriente") cuentaActual = miCuentaCorriente;
        if (opcion === "tarjeta") cuentaActual = miTarjetaCredito;
        
        if (grupoCuotas) {
            grupoCuotas.style.display = (cuentaActual instanceof TarjetaCredito) ? "block" : "none";
        }

        actualizarPantalla();
    });
}

if (formOperacion) {
    formOperacion.addEventListener("submit", (e) => {
        e.preventDefault();

        const tipo = selectTipoOperacion.value;
        const monto = parseFloat(inputMonto.value);

        if (isNaN(monto) || monto <= 0) {
            alert("Por favor ingrese un monto válido.");
            return;
        }

        let exito = false;

        if (tipo === "consignar" || tipo === "depositar") {
            if (typeof cuentaActual.consignar === "function") {
                exito = cuentaActual.consignar(monto);
            } else if (typeof cuentaActual.depositar === "function") {
                exito = cuentaActual.depositar(monto);
            }
        } else if (tipo === "retirar") {
            if (typeof cuentaActual.retirar === "function") {
                exito = cuentaActual.retirar(monto);
            }
        }

        if (exito !== false) {
            alert("¡Operación realizada con éxito!");
            inputMonto.value = "";
            actualizarPantalla();
        }
    });
}

if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener("click", () => {
        alert("Sesión cerrada correctamente.");
        localStorage.removeItem('sesionActiva');
        window.location.href = "index.html";
    });
}
// Actualizar las opciones del tipo de operación dinámicamente
function actualizarOpcionesOperacion() {
    if (!selectTipoOperacion) return;

    selectTipoOperacion.innerHTML = ""; // Limpiar opciones anteriores

    if (cuentaActual instanceof TarjetaCredito) {
        // Opciones exclusivas para Tarjeta de Crédito
        selectTipoOperacion.innerHTML = `
            <option value="comprar">Realizar Compra / Avance</option>
            <option value="pagar">Pagar Deuda de Tarjeta</option>
        `;
        if (grupoCuotas) grupoCuotas.style.display = "block";
    } else {
        // Opciones exclusivas para Cuentas de Ahorros y Corriente
        selectTipoOperacion.innerHTML = `
            <option value="consignar">Consignar Dinero</option>
            <option value="retirar">Retirar Dinero</option>
        `;
        if (grupoCuotas) grupoCuotas.style.display = "none";
    }
}

// Escuchar el cambio en el selector de producto
if (elSelectorCuenta) {
    elSelectorCuenta.addEventListener("change", (e) => {
        const opcion = e.target.value;
        if (opcion === "ahorros") cuentaActual = miCuentaAhorros;
        if (opcion === "corriente") cuentaActual = miCuentaCorriente;
        if (opcion === "tarjeta") cuentaActual = miTarjetaCredito;
        
        actualizarOpcionesOperacion();
        actualizarPantalla();
    });
}

// Llamar al cargar el cajero por primera vez
actualizarOpcionesOperacion();
actualizarPantalla();

// Inicializar la pantalla si estamos en el cajero
actualizarPantalla();

//SECCION 7 FORMULARIO CONTACTO
const formContacto = document.getElementById("form-contacto");
if (formContacto) {
    const btnEnviar = formContacto.querySelector("button");
    if (btnEnviar) {
        btnEnviar.addEventListener("click", (e) => {
            e.preventDefault();
            const inputs = formContacto.querySelectorAll("input, textarea");
            let hayVacios = false;
            inputs.forEach(input => {
                if (input.value.trim() === "") {
                    hayVacios = true;
                }
            });
            if (hayVacios) {
                alert("Por favor complete todos los campos.");
                return;
            }
            alert("¡Gracias por contactarnos! Hemos recibido su mensaje.");
            formContacto.reset();
        });
    }   
}