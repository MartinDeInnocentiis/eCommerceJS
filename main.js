/*
-------------------------------------------
           ENTREGA 03: ECOMMERCE
           Martin De Innocentiis           
-------------------------------------------
*/


//ME TRAIGO LOS ELEMENTOS DEL DOM
const formulario = document.getElementById("formulario")
const inputNombre = document.getElementById("nombre")
const inputApellido = document.getElementById("apellido")
const h2 = document.getElementById("h2")
const div = document.getElementById("div")


//CREO UNA CLASE "PRODUCT"
class Product {
    constructor(id, nombre, precio, stock) {
        this.id = id;
        this.nombre = nombre;
        this.precio = precio;
        this.stock = stock;
    }
}


//CREO LOS OBJETOS "PRODUCTOS"
const productos = [
    new Product(1, "Guantes de Boxeo", 18500, 11),
    new Product(2, "Tibiales", 21000, 8),
    new Product(3, "Guantes de MMA", 14900, 6),
    new Product(4, "Cabezal de Sparring", 12600, 4),
    new Product(5, "Mouthguard", 4800, 18),
    new Product(6, "Kimono JiuJitsu", 35000, 13),
    new Product(7, "Bolso XL", 28000, 8),
    new Product(8, "Hoodie", 15900, 15),
    new Product(9, "Short MMA", 7500, 9)
]


//CREO UN ARRAY "CARRITO" VACIO
const carrito = []


//FUNCION QUE GUARDA LOS DATOS DEL USUARIO EN EL STORAGE, O CORROBORA SI YA SE ENCUENTRA
function userInStorage() {
    formulario.onsubmit = (e) => { //CREO UN OBJETO FRENTE AL SIGUIENTE EVENTO: SUBMIT DEL FORMULARIO
        e.preventDefault()
        const usuario = {
            nombre: inputNombre.value,
            apellido: inputApellido.value,
        }
        localStorage.setItem("Usuario", JSON.stringify(usuario)) //GUARDO EL OBJETO CREADO EN EL STORAGE
        logeado(usuario); //UNA VEZ SETEADO EL OBJETO, EJECUTO LA FUNCION LOGEADO
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
    h2.innerText = `Bienvenido a la tienda, ${u.nombre} ${u.apellido.toUpperCase()}!`
    productos.forEach(prod => {
        div.innerHTML += `<div class="card" style="width: 18rem;">
        <div class="card-body">
                <h5 class="card-title">${prod.nombre}</h5>
                <p class="card-text">${prod.precio}</p>
                <button id=${prod.id} class="btn btn-warning">AGREGAR</button>  
        </div>
        </div>`
    })
    agregarProductos()
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
            confirmButtonColor: '#3085d6',
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
function agregarProductos() {
    const botonesAgregar = Array.from(document.getElementsByClassName("btn-warning")); //BUSCO TODOS LOS BOTONES DEL DOM. CONVIERTO LA VARIABLE EN UN ARRAY PARA PODER APLICAR EL METODO FOREACH()
    botonesAgregar.forEach(boton => {
        boton.onclick = () => {
            const producto = productos.find(p => p.id === parseInt(boton.id));

            const productoCarrito = { //CREO EL SIGUIENTE OBJETO A PARTIR DEL RESULTADO DE DICHA BÚSQUEDA, PARA USAR LUEGO EL ATRIBUTO CANTIDAD.
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                cantidad: 1,
            }

            const productoEnCarrito = carrito.find(p => p.id === (productoCarrito.id)); // CREO UNA VARIABLE QUE BUSQUE SI EL PRODUCTO YA ESTÁ DENTRO DEL ARRAY CARRITO
            if (!productoEnCarrito) {
                carrito.push(productoCarrito) //SI NO ESTÁ, SE LO PUSHEA AL ARRAY
            } else {
                productoEnCarrito.cantidad++ //SI ESTÁ, SE AUMENTA SU CANTIDAD EN +1
            }
            console.log(carrito);
        }
    })
}


//FINALIZAR COMPRA
function finalizarCompra() {
    //CREO EL BOTON FINALIZAR COMPRA. SE ESTABLECE UN ID, TEXTO, ESTILO, y SE POSICIONA AL FINAL DEL CUERPO DEL DOCUMENTO.
    const botonFinalizar = document.createElement("button")
    botonFinalizar.id = "finalizar"
    botonFinalizar.innerText = "FINALIZAR COMPRA"
    botonFinalizar.style = "background-color: green; color: white; position:absolute; left:50%; transform:translateX(-50%); margin-top:3rem;  padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;";
    document.body.appendChild(botonFinalizar)
    const thead = document.getElementById("thead")
    const tbody = document.getElementById("tbody")
    const parrafoTotal = document.getElementById("precioTotal")
    //AL HACERLE CLICK; ELIMINO EL DIV QUE CONTIENE LOS PRODUCTOS; EL BOTON EN SI, Y CREO LA TABLA CON LOS PROD SELECCIONADOS
    botonFinalizar.onclick = () => {
        div.remove()
        botonFinalizar.remove()
        h2.innerText = `FINALIZAR LA COMPRA`
        thead.innerHTML = `<tr>
            <th scope="col">Item</th>
            <th scope="col">Cantidad</th>
            <th scope="col">Precio</th>
        </tr>`
        let totalCompra = 0
        carrito.forEach(productos => {
            totalCompra += productos.cantidad * productos.precio
            tbody.innerHTML += `
        <tr>
            <td>${productos.nombre}</td>
            <td>${productos.cantidad}</td>
            <td>${productos.cantidad * productos.precio}</td>
        </tr>`
        })
        parrafoTotal.innerText = `El precio total de tu compra es:  $ ${totalCompra}`
        parrafoTotal.style.cssText = "color: #0B0F2E; font-size: 20px; font-weight: bold;"
        volverATienda()
    }
}

function volverATienda(){
    const usuario = localStorage.getItem("Usuario")
    const infoUsuarioJSON = JSON.parse(usuario) //DECLARO NUEVAMENTE ESTAS VARIABLES, YA QUE EXISTEN DENTRO DE LA FUNCION
    const volver = document.createElement("button") //CREO EL BOTON CORRESPONDIENTE
    volver.id = "volver";
    volver.innerText = "VOLVER";
    volver.style = "background-color: green; color: white; position:absolute; left:50%; transform:translateX(-50%); margin-top:3rem;  padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;";
    document.body.appendChild(volver)
    volver.onclick = () => {
        Swal.fire({ //CREO LA SIGUIENTE ALERTA PARA EL EVENTO ONCLICK DEL BOTON CERRAR SESION
            title: '¿Deseas volver?',
            text: 'Se vaciarán los items que se encuentran dentro de tu carrito',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
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
function main(){
    userInStorage() //LLAMA A LA FUNCION userInStorage(), LA CUAL ESTÁ RELACIONADA AL RESTO DE LAS FUNCIONES
}

//EJECUTO MAIN, QUE CORRE TODO EL CÓDIGO
main()