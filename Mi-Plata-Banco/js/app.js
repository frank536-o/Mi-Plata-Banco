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
            const cedula = d.cedula || d.Id || "000";
            const user = d.nombreUsuario || d.nombreDeUsuario || d.usuario || "user";
            const pass = d.clave || d.password || "123";
            const tel = d.telefono || d.telefonoCelular || "000";
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

const productosCliente = {
    ahorros: miCuentaAhorros,
    corriente: miCuentaCorriente,
    tarjeta: miTarjetaCredito
};

function claveEstadoProductos(documento) {
    return `cuentasCliente_${encodeURIComponent(String(documento))}`;
}

function restaurarEstadoCuenta(cuenta, estado) {
    if (!estado) return;
    if (cuenta instanceof TarjetaCredito) {
        cuenta.saldoUtilizado = Number(estado.saldoUtilizado) || 0;
        cuenta.saldoCapital = Number.isFinite(Number(estado.saldoCapital))
            ? Number(estado.saldoCapital)
            : cuenta.saldoUtilizado;
    } else if (Number.isFinite(Number(estado.saldo))) {
        cuenta.saldoInicial = Number(estado.saldo);
    }
    cuenta.historialDeMovimientos = Array.isArray(estado.movimientos)
        ? estado.movimientos.map(movimiento => ({
            ...movimiento,
            fechaHora: new Date(movimiento.fechaHora)
        }))
        : [];
}

function guardarEstadoCuenta(documento, tipoProducto, cuenta) {
    const clave = claveEstadoProductos(documento);
    const estados = JSON.parse(localStorage.getItem(clave) || "{}");
    estados[tipoProducto] = {
        saldo: cuenta instanceof TarjetaCredito ? undefined : cuenta.saldoInicial,
        saldoUtilizado: cuenta instanceof TarjetaCredito ? cuenta.saldoUtilizado : undefined,
        saldoCapital: cuenta instanceof TarjetaCredito ? cuenta.saldoCapital : undefined,
        movimientos: cuenta.historialDeMovimientos
    };
    localStorage.setItem(clave, JSON.stringify(estados));
}

function guardarProductosClienteActual() {
    Object.entries(productosCliente).forEach(([tipo, cuenta]) => {
        guardarEstadoCuenta(obtenerDocumentoCliente(clienteActualSesion), tipo, cuenta);
    });
}

function cargarProductosClienteActual() {
    const clave = claveEstadoProductos(obtenerDocumentoCliente(clienteActualSesion));
    const estados = JSON.parse(localStorage.getItem(clave) || "{}");
    Object.entries(productosCliente).forEach(([tipo, cuenta]) => {
        restaurarEstadoCuenta(cuenta, estados[tipo]);
    });
}

function crearCuentaProducto(tipo, titular, estado) {
    const cuenta = tipo === "ahorros"
        ? new CuentaAhorros(`AH-${obtenerDocumentoCliente(titular)}`, 0, titular)
        : tipo === "corriente"
            ? new CuentaCorriente(`CC-${obtenerDocumentoCliente(titular)}`, 0, titular)
            : new TarjetaCredito(`TC-${obtenerDocumentoCliente(titular)}`, 1500000, titular);
    restaurarEstadoCuenta(cuenta, estado);
    return cuenta;
}

function cargarCuentaRegistrada(cliente, tipo) {
    const clave = claveEstadoProductos(obtenerDocumentoCliente(cliente));
    const estados = JSON.parse(localStorage.getItem(clave) || "{}");
    return crearCuentaProducto(tipo, cliente, estados[tipo]);
}

function renderizarHistorial(cuenta) {
    if (!elListaMovimientos) return;
    elListaMovimientos.innerHTML = "";
    const movimientos = [...cuenta.historialDeMovimientos].sort((a, b) =>
        new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime()
    );
    if (movimientos.length === 0) {
        elListaMovimientos.innerHTML = "<li>No hay movimientos registrados.</li>";
        return;
    }

    const formatoFechaHora = new Intl.DateTimeFormat("es-CO", {
        dateStyle: "medium",
        timeStyle: "medium"
    });
    const formatoDinero = new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
    });
    movimientos.forEach(movimiento => {
        const item = document.createElement("li");
        const fecha = new Date(movimiento.fechaHora);
        const descripcion = document.createElement("strong");
        descripcion.textContent = movimiento.tipoDeTransaccion || "Movimiento";
        const detalle = document.createElement("div");
        detalle.textContent = `${formatoFechaHora.format(fecha)} · ${formatoDinero.format(Number(movimiento.valor) || 0)}`;
        item.style.cssText = "padding: 12px 10px; margin-bottom: 8px; background: #f7f9fb; border-left: 4px solid #00a86b; border-radius: 5px;";
        item.append(descripcion, detalle);
        elListaMovimientos.appendChild(item);
    });
}

let cuentaActual = miCuentaAhorros;

function obtenerDocumentoCliente(cliente) {
    return String(cliente.cedula || cliente.Id || "");
}

function actualizarInformacionPerfil() {
    if (!perfilNombre) return;

    perfilNombre.textContent = clienteActualSesion.nombreCompleto || clienteActualSesion.nombre || "";
    perfilUsuario.textContent = clienteActualSesion.nombreUsuario || clienteActualSesion.nombreDeUsuario || clienteActualSesion.usuario || "";
    perfilId.textContent = obtenerDocumentoCliente(clienteActualSesion);
    perfilTelefono.textContent = clienteActualSesion.telefono || clienteActualSesion.telefonoCelular || "";

    const inputNombre = document.getElementById("editar-nombre");
    const inputUsuario = document.getElementById("editar-usuario");
    const inputDocumento = document.getElementById("editar-documento");
    const inputTelefono = document.getElementById("editar-telefono");
    if (inputNombre) inputNombre.value = perfilNombre.textContent;
    if (inputUsuario) inputUsuario.value = perfilUsuario.textContent;
    if (inputDocumento) inputDocumento.value = perfilId.textContent;
    if (inputTelefono) inputTelefono.value = perfilTelefono.textContent;
}

function obtenerUsuariosRegistrados() {
    const datos = localStorage.getItem("listaClientes");
    return datos ? JSON.parse(datos) : [];
}

function indiceClienteActual(usuarios) {
    const documentoActual = obtenerDocumentoCliente(clienteActualSesion);
    return usuarios.findIndex(cliente => obtenerDocumentoCliente(cliente) === documentoActual);
}


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
const grupoDestinoTipo = document.getElementById("grupoDestinoTipo");
const tipoDestino = document.getElementById("tipoDestino");
const grupoProductoDestino = document.getElementById("grupoProductoDestino");
const productoDestino = document.getElementById("productoDestino");
const grupoUsuarioDestino = document.getElementById("grupoUsuarioDestino");
const usuarioDestino = document.getElementById("usuarioDestino");
const btnCerrarSesion = document.getElementById("btn-cerrar-sesion");

const btnRegistrar = document.getElementById("btn-registrarse");
const btnIniciarSesion = document.getElementById("btn-iniciar-sesion");
const btnAccederCajero = document.getElementById("btn-acceder-cajero");

const modalRegistro = document.getElementById("modal-registro");
const btnCerrarModal = document.getElementById("btn-cerrar-modal");
const formRegistro = document.getElementById("form-registro");
const botonesAbrirRegistro = document.querySelectorAll(".btn-abrir-registro");
const perfilNombre = document.getElementById("perfilNombre");
const perfilUsuario = document.getElementById("perfilUsuario");
const perfilId = document.getElementById("perfilId");
const perfilTelefono = document.getElementById("perfilTelefono");
const btnMostrarEdicionPerfil = document.getElementById("btn-mostrar-edicion-perfil");
const btnMostrarCambioClave = document.getElementById("btn-mostrar-cambio-clave");
const btnEliminarCuenta = document.getElementById("btn-eliminar-cuenta");
const formEdicionPerfil = document.getElementById("form-edicion-perfil");
const formCambioClave = document.getElementById("form-cambio-clave");

const modalLogin = document.getElementById("modal-login");
const btnCerrarLogin = document.getElementById("btn-cerrar-login");
const formLogin = document.getElementById("form-login");

if (elNombreCliente) cargarProductosClienteActual();

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
        const cupoDisponible = cuentaActual.cupoCredito - cuentaActual.saldoCapital;
        elSaldoActual.textContent = `Deuda: ${formateador.format(cuentaActual.saldoUtilizado)} | Cupo Disp: ${formateador.format(cupoDisponible)}`;
    } else {
        elSaldoActual.textContent = `Saldo Disponible: ${formateador.format(cuentaActual.consultarSaldo())}`;
    }

    renderizarHistorial(cuentaActual);
    guardarProductosClienteActual();
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

if (modalRegistro) {
    botonesAbrirRegistro.forEach((boton) => {
        boton.addEventListener("click", (e) => {
            e.preventDefault();
            modalRegistro.style.display = "flex";
        });
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
        const confirmarClave = document.getElementById("reg-confirmar-clave").value.trim();
        const telefono = document.getElementById("reg-telefono").value.trim();

        if (clave !== confirmarClave) {
            alert("La contraseña y su confirmación no coinciden.");
            return;
        }

        let listaUsuarios = JSON.parse(localStorage.getItem('listaClientes')) || [];
        const usuarioDuplicado = listaUsuarios.some(cliente =>
            (cliente.nombreUsuario || "").trim().toLowerCase() === usuario.toLowerCase() ||
            (cliente.cedula || "").trim() === cedula
        );
        if (usuarioDuplicado) {
            alert("El usuario o la cédula ya existe. Por favor, ingrese uno diferente.");
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

        actualizarOpcionesOperacion();
        actualizarPantalla();
    });
}

function actualizarCamposDestino() {
    const esTransferencia = selectTipoOperacion && selectTipoOperacion.value === "transferir";
    if (grupoDestinoTipo) grupoDestinoTipo.style.display = esTransferencia ? "block" : "none";
    if (tipoDestino) tipoDestino.disabled = !esTransferencia;

    const destinoExterno = esTransferencia && tipoDestino && tipoDestino.value === "otro-usuario";
    if (grupoUsuarioDestino) grupoUsuarioDestino.style.display = destinoExterno ? "block" : "none";
    if (usuarioDestino) usuarioDestino.disabled = !destinoExterno;
    if (!destinoExterno && usuarioDestino) usuarioDestino.value = "";

    if (grupoProductoDestino) grupoProductoDestino.style.display = esTransferencia ? "block" : "none";
    if (productoDestino) productoDestino.disabled = !esTransferencia;

    const cuotasVisibles = cuentaActual instanceof TarjetaCredito &&
        selectTipoOperacion &&
        selectTipoOperacion.value === "comprar";
    if (grupoCuotas) grupoCuotas.style.display = cuotasVisibles ? "block" : "none";
}

function registrarTransferencia(monto) {
    if (cuentaActual instanceof TarjetaCredito) {
        alert("No se permiten transferencias desde la tarjeta de crédito.");
        return false;
    }

    const productoOrigen = elSelectorCuenta.value;
    const productoReceptor = productoDestino.value;
    const propia = tipoDestino.value === "propia";
    let destinatario;
    if (propia) {
        if (productoOrigen === productoReceptor) {
            alert("No se permiten transferencias al mismo producto.");
            return false;
        }
        destinatario = clienteActualSesion;
    } else {
        const nombreUsuario = usuarioDestino.value.trim().toLowerCase();
        if (!nombreUsuario) {
            alert("Ingrese el nombre de usuario del destinatario.");
            return false;
        }
        destinatario = obtenerUsuariosRegistrados().find(cliente =>
            (cliente.nombreUsuario || cliente.nombreDeUsuario || cliente.usuario || "").trim().toLowerCase() === nombreUsuario
        );
        if (!destinatario) {
            alert("El usuario al que desea transferir no existe.");
            return false;
        }
        if (obtenerDocumentoCliente(destinatario) === obtenerDocumentoCliente(clienteActualSesion)) {
            alert("Para transferir entre sus propios productos, seleccione 'Otro producto mío'.");
            return false;
        }
    }

    const cuentaReceptora = propia
        ? productosCliente[productoReceptor]
        : cargarCuentaRegistrada(destinatario, productoReceptor);
    if (cuentaReceptora instanceof TarjetaCredito && cuentaReceptora.saldoUtilizado < monto) {
        alert("El monto supera la deuda pendiente de la tarjeta destinataria.");
        return false;
    }

    if (monto > cuentaActual.saldoInicial) {
        alert("Saldo insuficiente para realizar la transferencia.");
        return false;
    }

    const nombreDestino = destinatario.nombreCompleto || destinatario.nombre || "usuario";
    const tipoProductoDestino = {
        ahorros: "Cuenta de Ahorros",
        corriente: "Cuenta Corriente",
        tarjeta: "Tarjeta de Crédito"
    }[productoReceptor];
    cuentaActual.saldoInicial -= monto;
    cuentaActual.registrarMovimiento(`Transferencia enviada a ${nombreDestino} — ${tipoProductoDestino}`, monto);

    if (cuentaReceptora instanceof TarjetaCredito) {
        if (!cuentaReceptora.pagarTarjeta(monto)) return false;
        cuentaReceptora.historialDeMovimientos[0].tipoDeTransaccion += ` — recibida como pago desde ${clienteActualSesion.nombreCompleto || "usuario"}`;
    } else {
        cuentaReceptora.saldoInicial += monto;
        cuentaReceptora.registrarMovimiento(`Transferencia recibida de ${clienteActualSesion.nombreCompleto || "usuario"} — ${tipoProductoDestino}`, monto);
    }

    if (!propia) {
        guardarEstadoCuenta(obtenerDocumentoCliente(destinatario), productoReceptor, cuentaReceptora);
    }
    return true;
}

if (formOperacion) {
    formOperacion.addEventListener("submit", (e) => {
        e.preventDefault();

        const tipo = selectTipoOperacion.value;
        const monto = parseFloat(inputMonto.value);

        if (isNaN(monto) || monto <= 0) {
            alert(tipo === "transferir"
                ? "El valor de la transferencia debe ser mayor a 0."
                : "Por favor ingrese un monto válido.");
            return;
        }

        let exito = false;

        if (tipo === "transferir") {
            exito = registrarTransferencia(monto);
        } else if (tipo === "comprar" && cuentaActual instanceof TarjetaCredito) {
            const cuotas = parseInt(document.getElementById("numeroCuotas").value, 10);
            exito = cuentaActual.realizarCompra(monto, cuotas);
        } else if (tipo === "pagar" && cuentaActual instanceof TarjetaCredito) {
            exito = cuentaActual.pagarTarjeta(monto);
        } else if (tipo === "consignar" || tipo === "depositar") {
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
            if (tipoDestino) tipoDestino.value = "propia";
            inputMonto.value = "";
            formOperacion.reset();
            actualizarOpcionesOperacion();
            actualizarPantalla();
        }
    });
}

if (selectTipoOperacion) {
    selectTipoOperacion.addEventListener("change", actualizarCamposDestino);
}
if (tipoDestino) {
    tipoDestino.addEventListener("change", actualizarCamposDestino);
}

if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener("click", () => {
        alert("Sesión cerrada correctamente.");
        localStorage.removeItem('sesionActiva');
        window.location.href = "index.html";
    });
}

if (btnMostrarEdicionPerfil && formEdicionPerfil && formCambioClave) {
    btnMostrarEdicionPerfil.addEventListener("click", () => {
        formEdicionPerfil.style.display = "block";
        formCambioClave.style.display = "none";
        actualizarInformacionPerfil();
    });
}

if (btnMostrarCambioClave && formEdicionPerfil && formCambioClave) {
    btnMostrarCambioClave.addEventListener("click", () => {
        formEdicionPerfil.style.display = "none";
        formCambioClave.style.display = "block";
    });
}

const btnCancelarEdicionPerfil = document.getElementById("btn-cancelar-edicion-perfil");
if (btnCancelarEdicionPerfil && formEdicionPerfil) {
    btnCancelarEdicionPerfil.addEventListener("click", () => {
        formEdicionPerfil.reset();
        formEdicionPerfil.style.display = "none";
    });
}

const btnCancelarCambioClave = document.getElementById("btn-cancelar-cambio-clave");
if (btnCancelarCambioClave && formCambioClave) {
    btnCancelarCambioClave.addEventListener("click", () => {
        formCambioClave.reset();
        formCambioClave.style.display = "none";
    });
}

if (formEdicionPerfil) {
    formEdicionPerfil.addEventListener("submit", (e) => {
        e.preventDefault();

        const nombre = document.getElementById("editar-nombre").value.trim();
        const usuario = document.getElementById("editar-usuario").value.trim();
        const telefono = document.getElementById("editar-telefono").value.trim();
        const documentoActual = obtenerDocumentoCliente(clienteActualSesion);
        const usuarios = obtenerUsuariosRegistrados();
        const indiceActual = indiceClienteActual(usuarios);

        if (indiceActual === -1) {
            alert("No se encontró la cuenta registrada para guardar los cambios.");
            return;
        }

        const usuarioEnUso = usuarios.some((cliente, indice) =>
            indice !== indiceActual &&
            (cliente.nombreUsuario || cliente.nombreDeUsuario || cliente.usuario || "").trim().toLowerCase() === usuario.toLowerCase()
        );
        if (usuarioEnUso) {
            alert("Ese nombre de usuario ya existe. Por favor, ingrese uno diferente.");
            return;
        }

        Object.assign(usuarios[indiceActual], {
            nombreCompleto: nombre,
            nombreUsuario: usuario,
            cedula: documentoActual,
            telefono: telefono
        });
        localStorage.setItem("listaClientes", JSON.stringify(usuarios));

        clienteActualSesion.nombreCompleto = nombre;
        clienteActualSesion.nombre = nombre;
        clienteActualSesion.nombreUsuario = usuario;
        clienteActualSesion.nombreDeUsuario = usuario;
        clienteActualSesion.cedula = documentoActual;
        clienteActualSesion.Id = documentoActual;
        clienteActualSesion.telefono = telefono;
        clienteActualSesion.telefonoCelular = telefono;
        guardarSesionActiva(clienteActualSesion);
        actualizarInformacionPerfil();
        actualizarPantalla();
        formEdicionPerfil.style.display = "none";
        alert("Los datos de tu perfil se actualizaron correctamente.");
    });
}

if (formCambioClave) {
    formCambioClave.addEventListener("submit", (e) => {
        e.preventDefault();

        const claveActual = document.getElementById("clave-actual").value;
        const claveNueva = document.getElementById("clave-nueva").value;
        const confirmacion = document.getElementById("clave-confirmacion").value;
        if (claveActual !== clienteActualSesion.clave) {
            alert("La contraseña actual no es correcta.");
            return;
        }
        if (claveNueva !== confirmacion) {
            alert("La contraseña nueva y su confirmación no coinciden.");
            return;
        }

        const usuarios = obtenerUsuariosRegistrados();
        const indiceActual = indiceClienteActual(usuarios);
        if (indiceActual === -1) {
            alert("No se encontró la cuenta registrada para guardar la nueva contraseña.");
            return;
        }

        usuarios[indiceActual].clave = claveNueva;
        localStorage.setItem("listaClientes", JSON.stringify(usuarios));
        clienteActualSesion.clave = claveNueva;
        guardarSesionActiva(clienteActualSesion);
        formCambioClave.reset();
        formCambioClave.style.display = "none";
        alert("Tu contraseña se cambió correctamente.");
    });
}

if (btnEliminarCuenta) {
    btnEliminarCuenta.addEventListener("click", () => {
        if (!confirm("¿Está seguro de que desea eliminar su cuenta? Esta acción no se puede deshacer.")) return;

        const documentoActual = obtenerDocumentoCliente(clienteActualSesion);
        const datosClienteRegistrado = localStorage.getItem("clienteRegistrado");
        let clienteRegistrado = null;
        if (datosClienteRegistrado) {
            try {
                clienteRegistrado = JSON.parse(datosClienteRegistrado);
            } catch (error) {
                console.error("No se pudo leer el cliente guardado:", error);
                alert("No se pudo completar la eliminación porque los datos locales de la cuenta no se pudieron leer.");
                return;
            }
        }

        const usuarios = obtenerUsuariosRegistrados();
        const usuariosActualizados = usuarios.filter(cliente => obtenerDocumentoCliente(cliente) !== documentoActual);
        localStorage.setItem("listaClientes", JSON.stringify(usuariosActualizados));
        localStorage.removeItem(claveEstadoProductos(documentoActual));

        if (clienteRegistrado && obtenerDocumentoCliente(clienteRegistrado) === documentoActual) {
            localStorage.removeItem("clienteRegistrado");
        }
        localStorage.removeItem("sesionActiva");
        alert("Tu cuenta fue eliminada correctamente.");
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
    } else {
        // Opciones exclusivas para Cuentas de Ahorros y Corriente
        selectTipoOperacion.innerHTML = `
            <option value="consignar">Consignar Dinero</option>
            <option value="retirar">Retirar Dinero</option>
            <option value="transferir">Transferir</option>
        `;
    }
    actualizarCamposDestino();
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
        actualizarInformacionPerfil();
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