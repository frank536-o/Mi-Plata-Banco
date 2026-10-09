/*clase movimiento*/

class Movimiento {
    constructor(tipoDeTransaccion, valor) {
        this.fechaHora = new Date(); // Fecha y hora actual
        this.tipoDeTransaccion = tipoDeTransaccion; // "retiro" o "deposito"
        this.valor = valor; // Valor de la transacción
    } 

    obtenerDetalle() {
     const fecha = this.fechaHora.toLocaleDateString('es-CO');   // Formato de fecha local
        const dinero = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(this.valor); // Formato de moneda local
         return `${fecha} - ${this.tipoDeTransaccion}: ${dinero}`;
    }
      
    }

    /*Clase Cliente*/

    class Cliente {
        constructor(nombreCompleto, Id, nombreDeUsuario, clave, telefonoCelular) {
            this.nombreCompleto = nombreCompleto;
            this.Id = Id;
            this.nombreDeUsuario = nombreDeUsuario;
            this.clave = clave;
            this.telefonoCelular = telefonoCelular;
        }
    }   

    /*Clase Cuenta(Padre)*/

    class Cuenta {
        constructor(numeroDeCuenta, saldoInicial, titular) {
            this.numeroDeCuenta = numeroDeCuenta;
            this.saldoInicial = saldoInicial;
            this.titular = titular; /*Resive un objeto de tipoCliente*/
            this.historialDeMovimientos = []; /*Array para almacenar los movimientos de la cuenta*/
        }
        // Metodo para guardar el registro//

        registrarMovimiento(tipoDeTransaccion, valor) {
            const nuevoMovimiento = new Movimiento(tipoDeTransaccion, valor);
            this.historialDeMovimientos.unshift(nuevoMovimiento);
        }

        consignar(valor) {
            if (valor <= 0) {
                alert("El valor a consignar debe ser mayor que cero.");
                return false;
            }
                this.saldoInicial += valor;
                this.registrarMovimiento("Consignación", valor);
                return true;
            }
    
    retirar(valor) {
                if (valor <= 0) {
                    alert("El valor a retirar debe ser mayor que cero.");
                    return false;
                }
                    if (valor > this.saldoInicial) {
                        alert("Saldo insuficiente para realizar esta transacción.");
                        return false;
                    }
                       this.saldoInicial -= valor;
                        this.registrarMovimiento("Retiro", valor);
                        return true;
                    }
             consultarSaldo() {
            return this.saldoInicial;
        }
    }


//Clase CuentaAhorros(Hija de Cuenta)//

class CuentaAhorros extends Cuenta {
    constructor(numeroCuenta, saldoInicial, titular) {
        super(numeroCuenta, saldoInicial, titular);
        this.tasaInteres = 0.015;
    }
    retirar(valor) {
        if (valor <= 0) {
            alert("El valor a retirar debe ser mayor que cero.");
            return false;
        }
            const rendimientoInteres = valor * this.tasaInteres;
            const montoTotalaRetirar = valor - rendimientoInteres;  
            if (montoTotalaRetirar > this.saldoInicial) {
                alert("Saldo insuficiente para realizar esta transacción.");
                return false;
            }
            this.saldoInicial -= montoTotalaRetirar;
            this.registrarMovimiento(`Retiro Ahorros (Ganancia de Interés: +$${rendimientoInteres})`, valor);
            return true;    
        }
}

//Clase CuentaCorriente(Hija de Cuenta)//

class CuentaCorriente extends Cuenta {
    constructor(numeroCuenta, saldoInicial, titular) {
        super(numeroCuenta, saldoInicial, titular);
        this.tasaInteres = 0.02;
    }
    retirar(valor) {
        if (valor <= 0) {
            alert("El valor a retirar debe ser mayor que cero.");
            return false;
        }
            const sobregiroPermitido = this.saldoInicial * 0.20; // 20% del saldo inicial como sobregiro permitido
            const limiteMaximo = this.saldoInicial+sobregiroPermitido;
            if (valor > limiteMaximo) {
                alert(`El retiro excede el límite permitido de sobregiro. ($${limiteMaximo} COP)`);
                return false;
            }
            this.saldoInicial -= valor;
            this.registrarMovimiento("Retiro cuenta corriente", valor);
            return true;
        }
    }

    //clase Tarjeta de Credito//

    class TarjetaCredito {
        constructor(numeroTarjeta, cupoCredito, titular) {
            this.numeroTarjeta = numeroTarjeta;
            this.cupoCredito = cupoCredito;
            this.titular = titular;
            this.saldoUtilizado = 0; // Inicialmente, el saldo utilizado es cero
            this.historialDeMovimientos = []; // Array para almacenar los movimientos de la tarjeta
        }
        obtenerTasaInteres(cuotas) {
            if (cuotas<=2) return 0; 
            if (cuotas>=3 && cuotas<=6) return 0.019;
            return 0.023;
        }
        realizarCompra(valor, cuotas) {
            if (valor <= 0) {
                alert("El valor de la compra debe ser mayor que cero.");
                return false;
            }
            const cupoDisponible = this.cupoCredito - this.saldoUtilizado;
            if (valor > cupoDisponible) {
                alert(`Compra rechazada. Cupo disponible: $${cupoDisponible} COP`);
                return false;
            }
            const tasaMensual = this.obtenerTasaInteres(cuotas);
            let cuotaMensual = 0;    
            if (tasaMensual===0) {
                cuotaMensual = valor / cuotas;
            }else{
                cuotaMensual = (valor * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -cuotas));
            }
            this.saldoUtilizado += valor;
            this.registrarMovimiento(`Compra a (${cuotas} cuotas al ${(tasaMensual * 100).toFixed(1)}%) - cuota/mes: $${cuotaMensual.toFixed(0)} `, valor);
            return true;
        }
        pagarTarjeta(valor) {
            if (valor <= 0) {
                alert("El valor a pagar debe ser mayor que cero.");
                return false;
            }
            if (valor > this.saldoUtilizado) {
                alert(`No puede pagar mas de lo que debe. Su deuda actual es: $${this.saldoUtilizado} COP`);
                return false;
            }
            this.saldoUtilizado -= valor;
            this.registrarMovimiento("Pago de tarjeta de credito", valor);
            return true;
        }
        registrarMovimiento(tipoDeTransaccion, valor) {
            const nuevoMovimiento = new Movimiento(tipoDeTransaccion, valor);
            this.historialDeMovimientos.unshift(nuevoMovimiento);
        }
    }


