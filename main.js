/*
-------------------------------------------
           ENTREGA FINAL: ECOMMERCE
           Martin De Innocentiis           
-------------------------------------------
*/


//ME TRAIGO LOS ELEMENTOS DEL DOM
const formulario = document.getElementById("formulario")
const inputNombre = document.getElementById("nombre")
const inputApellido = document.getElementById("apellido")
const h2 = document.getElementById("h2")
const div = document.getElementById("div")
const advertencia = document.getElementById("advertencia")
let productosFiltrados = [];


/*CREO UNA FUNCION QUE: 
CONFIGURA EL ACCESO A LA API A CONSUMIR
MANEJA LA PROMESA (RESULTADO DEL LLAMADO A LA API)
CREA DISTINTOS DIVS(PRODUCTOS) CON CADA RESULTADO
SE APLICAN DIVERSOS FILTROS PARA ELIMINAR RESULTADOS INDESEADOS
*/

function getJuegos() {
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': 'b426f84182mshf6e6dae0876a14cp1e2843jsnead4abc5cf2c',
            'X-RapidAPI-Host': 'steam2.p.rapidapi.com'
        }
    };

    fetch('https://steam2.p.rapidapi.com/search/Counter/page/1', options)
        .then(response => response.json())
        .then(response => {
            const productosAPI = response;
            console.log(response) //LOS VALORES DE LA PROPIEDAD PRICE ARROJABAN DIVERSOS RESULTADOS INDESEADOS, LO CUAL REQUIRIÓ APLICAR DIVERSOS FILTROS HASTA OBTENER SIMPLEMENTE EL FLOAT
            const productos = productosAPI.filter(juego => {

                const precio = juego.price ? juego.price.match(/[\d,]+/g) : '';  //SE USA LA EXPRESION [\d,] Y length PARA DETERMINAR SI HAY MÁS DE UN VALOR (HABIA RESULTADOS DOBLES), DETERMINANDO SI HAY MAS DE UNA COMA
                return precio && precio.length === 1 && precio[0] !== "Free to Play" && precio[0] !== "Free Demo"; //SE FILTRAN TAMBIEN LOS RESULTADOS VACIOS Y "FREE/TO PLAY/DEMO"
            }).map(juego => {
                return {
                    ...juego,
                    price: parseFloat(juego.price.replace(/[^0-9,]/g, '').replace(',', '.'))
                }
            });
            // AGREGO LOS PRODUCTOS AL CARRITO DE PRODUCTOS
            productosFiltrados = productos.filter(prod => prod.appId)

            // CREO LA TARJETA DE CADA PRODUCTO, PARA TODOS
            productosFiltrados.forEach(prod => {

                div.innerHTML += `<div class="card" style="width: 18rem";>
                                        <div class="card-body">
                                        <h5 class="card-title">${prod.title}</h5>
                                        <p class="card-text">US$ ${prod.price}</p>
                                        <button id=${prod.appId} class="btn btn-warning card-btn" style="background-color:#DDDA56; color:585846;">AGREGAR</button>  
                                        </div>
                                    </div>`;


            });

            // CAPTURAMOS TODOS LOS BOTONES 'Agregar' DE CADA PRODUCTO, Y LE AGREGAMOS EL EventListener 'agregarProducto': ESTE ES EL EVENTO QUE TOMARÁ COMO PARÁMETRO (LUEGO) LA FUNCION AGREGAR PRODUCTO 
            const btns = document.getElementsByClassName("card-btn")
            for (let i = 0; i < btns.length; i++) {
                btns[i].addEventListener("click", agregarProducto)
            }

        })
        .catch(err => console.error(err));

}




//CREO UN ARRAY "CARRITO" VACIO
const carrito = []

//FUNCION QUE GUARDA LOS DATOS DEL USUARIO EN EL STORAGE, O CORROBORA SI YA SE ENCUENTRA
function userInStorage() {
    formulario.onsubmit = (e) => { //CREO UN OBJETO FRENTE AL SIGUIENTE EVENTO: SUBMIT DEL FORMULARIO
        e.preventDefault()
        if (formulario.nombre.value === '' || formulario.apellido.value === '') {
            advertencia.textContent = 'Complete todos los campos para ingresar.';
        } else {
            const usuario = {
                nombre: inputNombre.value,
                apellido: inputApellido.value,
            }
            localStorage.setItem("Usuario", JSON.stringify(usuario)) //GUARDO EL OBJETO CREADO EN EL STORAGE
            logeado(usuario); //UNA VEZ SETEADO EL OBJETO, EJECUTO LA FUNCION LOGEADO
        }
    }

    const usuario = localStorage.getItem("Usuario")
    const infoUsuarioJSON = JSON.parse(usuario);
    if (infoUsuarioJSON) {
        logeado(infoUsuarioJSON); //O BIEN, SI EL USUARIO YA ESTÁ GUARDADO EN EL LOCAL STORAGE, EJECUTO LA FUNCION SIN VOLVER A PEDIRLE EL INGRESO
    }
}


/* CREO UNA FUNCION QUE (SI EL USUARIO ESTÁ LOGUEADO: SETEADO EL OBJETO USUARIO EN EL STORAGE) 
ELIMINA EL FORMULARIO, MODIFICA EL TEXTO DEL H2, AGREGA PRODUCTOS Y BOTON DE FINALIZAR AL DOM */
function logeado(u) {
    formulario.remove();
    advertencia.remove();
    h2.innerText = `Bienvenido a la tienda, ${u.nombre} ${u.apellido.toUpperCase()}!`
    getJuegos()
    deslogear()
    finalizarCompra()
}


//CREO FUNCION PARA CERRAR SESIÓN Y REMITIR NUEVAMENTE AL FORMULARIO DE INICIO VACÍO
function deslogear() {
    const cerrarSesion = document.createElement("button")
    cerrarSesion.id = "cerrarSesion";
    cerrarSesion.innerText = "CERRAR SESION";
    cerrarSesion.style = "background-color: #78503B; color: white; position:absolute; left:50%; transform:translateX(-50%); margin-top:7rem;  padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;";
    document.body.appendChild(cerrarSesion)
    cerrarSesion.onclick = () => {
        Swal.fire({ //CREO LA SIGUIENTE ALERTA PARA EL EVENTO ONCLICK DEL BOTON CERRAR SESION
            title: '¿Deseas salir?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#79CD7E',
            cancelButtonColor: '#C5BEBC',
            confirmButtonText: 'Salir'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.clear() //LIMPIO EL LOCALSTORAGE PARA ELIMINAR AL USUARIO, Y ASÍ TENER QUE COMPLETAR EL FORMULARIO DE INICIO NUEVAMENTE
                location.reload(); //APLICO MÉTODO PARA ACTUALIZAR AUTOMÁTICAMENTE, Y LLEVAR AL USUARIO DENUEVO AL FORMULARIO DE INICIO
            }
        })
    }
}


//FUNCION DE AGREGAR PRODUCTOS AL CARRITO, CONTROLANDO EL EVENTO ONCLICK DEL BOTON AGREGAR DE CADA PRODUCTO
const agregarProducto = (e) => {
    const productoId = e.target.id
    const product = productosFiltrados.filter(prod => prod.appId == productoId)[0] // TRAEMOS LA PRIMER POSICION PORQUE FILTER DEVUELVE EL OBJETO DENTRO DE UN ARRAY

    const productoCarrito = { //CREO EL SIGUIENTE OBJETO A PARTIR DEL RESULTADO DE DICHA BÚSQUEDA, PARA USAR LUEGO EL ATRIBUTO CANTIDAD.
        id: product.appId,
        nombre: product.title,
        precio: product.price,
        cantidad: 1,
    }
    const isProductoEnCarrito = carrito.find(p => p.id === (productoCarrito.id)); // CREO UNA VARIABLE QUE BUSQUE SI EL PRODUCTO YA ESTÁ DENTRO DEL ARRAY CARRITO

    if (!isProductoEnCarrito) {
        carrito.push(productoCarrito) //SI NO ESTÁ, SE LO PUSHEA AL ARRAY
        console.log(carrito)
    } else {
        isProductoEnCarrito.cantidad++ //SI ESTÁ, SE AUMENTA SU CANTIDAD EN +1
        console.log(carrito)
    }

    Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Agregado al carrito',
        showConfirmButton: false,
        timer: 700
    })
}


//FINALIZAR COMPRA
function finalizarCompra() {
    //CREO EL BOTON FINALIZAR COMPRA. SE ESTABLECE UN ID, TEXTO, ESTILO, y SE POSICIONA AL FINAL DEL CUERPO DEL DOCUMENTO.
    const botonFinalizar = document.createElement("button")
    botonFinalizar.id = "finalizar"
    botonFinalizar.innerText = "FINALIZAR COMPRA"
    botonFinalizar.style = "background-color: #79CD7E; color: white; position:absolute; left:50%; transform:translateX(-50%); margin-top:3rem;  padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;";
    document.body.appendChild(botonFinalizar)
    const thead = document.getElementById("thead")
    const tbody = document.getElementById("tbody")
    const parrafoTotal = document.getElementById("precioTotal")
    //AL HACERLE CLICK; ELIMINO EL DIV QUE CONTIENE LOS PRODUCTOS; EL BOTON EN SI, Y CREO LA TABLA CON LOS PROD SELECCIONADOS
    botonFinalizar.onclick = () => {
        if (carrito.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Parece que no has agregado ningún item al carrito',
              })
        } else {
        div.remove()
        botonFinalizar.remove()
        h2.innerText = `FINALIZAR LA COMPRA`
        thead.innerHTML = `<tr>
            <th scope="col">Item</th>
            <th scope="col">Cantidad</th>
            <th scope="col">Precio</th>
        </tr>`
        volverATienda()
        pagar()
        let totalCompra = 0
        carrito.forEach(productos => {
            totalCompra += productos.cantidad * productos.precio
            totalFixed = totalCompra.toFixed(2);
            tbody.innerHTML += `
        <tr>
            <td>${productos.nombre}</td>
            <td>${productos.cantidad}</td>
            <td>$${productos.cantidad * productos.precio}</td>
        </tr>`
        })
        parrafoTotal.innerText = `El precio total de tu compra es:  US$ ${totalFixed}`
        parrafoTotal.style.cssText = "color: #0B0F2E; font-size: 20px; font-weight: bold;"
        
    }}
}

function pagar() {
    //CREO EL BOTON PAGAR. SE ESTABLECE UN ID, TEXTO, ESTILO, y SE POSICIONA AL FINAL DEL CUERPO DEL DOCUMENTO.
    const botonPagar = document.createElement("button")
    botonPagar.id = "pagar"
    botonPagar.innerText = "CONTINUAR"
    botonPagar.style = "background-color: #79CD7E; color: white; position:absolute; right:1%; transform:translateX(-50%); margin-top:3rem;  padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;";
    document.body.appendChild(botonPagar)
    botonPagar.onclick = () => {
        const inputOptions = new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    '#ff0000': '<span style="font-size: 16px;">Crédito/Débito</span>',
                    '#00ff00': '<span style="font-size: 16px;">MercadoPago</span>',
                    '#0000ff': '<span style="font-size: 16px;">PayPal</span>'
                })
            }, 1000)
        })
        const { value: metodo } = Swal.fire({
            title: 'Escoge un método de pago',
            input: 'radio',
            inputOptions: inputOptions,
            inputValidator: (value) => {
                if (!value) {
                    return 'Debes escoger algún método de pago'
                }
                else {
                    Swal.fire({ html: `Muchas gracias. Aguarda y serás redireccionado` })
                }
            }
        })
    }
}

function volverATienda() {
    const usuario = localStorage.getItem("Usuario")
    const infoUsuarioJSON = JSON.parse(usuario) //DECLARO NUEVAMENTE ESTAS VARIABLES, YA QUE EXISTEN DENTRO DE LA FUNCION
    const volver = document.createElement("button") //CREO EL BOTON CORRESPONDIENTE
    volver.id = "volver";
    volver.innerText = "VOLVER";
    volver.style = "background-color: #7b7b7b; color: white; position:absolute; left:10%; transform:translateX(-50%); margin-top:3rem;  padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;";
    document.body.appendChild(volver)
    volver.onclick = () => {
        Swal.fire({ //CREO LA SIGUIENTE ALERTA PARA EL EVENTO ONCLICK DEL BOTON CERRAR SESION
            title: '¿Deseas volver?',
            text: 'Se vaciarán los items que se encuentran dentro de tu carrito',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#79CD7E',
            cancelButtonColor: '#C5BEBC',
            confirmButtonText: 'Atrás'
        }).then((result) => {
            if (result.isConfirmed) {
                logeado(infoUsuarioJSON)
                location.reload();
            }
        })
    }
}

//CREO UNA FUNCION MAIN PARA MANTENER LA MODULARIZACIÓN Y ESTRUCTURACIÓN DEL CÓDIGO
function main() {
    userInStorage() //LLAMA A LA FUNCION userInStorage(), LA CUAL ESTÁ RELACIONADA AL RESTO DE LAS FUNCIONES
}

//EJECUTO MAIN, QUE CORRE TODO EL CÓDIGO
main()