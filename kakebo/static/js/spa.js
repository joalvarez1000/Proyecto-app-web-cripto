/* creamos objeto categorias que luego irán en movimientos, no es necesario ponerolo con comillas*/
const categorias = { 
    CU : 'Cultura', 
    SU : 'Supervivencia', 
    OV : 'Ocio-vicio',
    EX : 'Extra' 
}

let losMovimientos
xhr = new XMLHttpRequest()

function recibeRespuesta() {
    if (this.readyState === 4 && (this.status === 200 || this.status === 201 )) {
        const respuesta = JSON.parse(this.responseText)

        if (respuesta.status !== 'success') {
            alert("Se ha producido un error en acceso a servidor "+ respuesta.mensaje)
            return
        }

        alert(respuesta.mensaje)

        llamaApiMovimientos()
    }
}

    
function detallaMovimiento (id) {

    //movimiento = losMovimientos.filter /item => item.id == id)[0]

    let movimiento
    for (let i=0; i < losMovimientos.length; i++) {
        const item = losMovimientos[i]
        if (item.id == id) {
            movimiento = item
            break
        }
    }

    if (!movimiento) return

    
    document.querySelector("#idMovimiento").value = id
    document.querySelector("#fecha").value = movimiento.fecha
    document.querySelector("#concepto").value = movimiento.concepto
    document.querySelector("#categoria").value = movimiento.categoria
    document.querySelector("#cantidad").value = movimiento.cantidad.toFixed(2)
    if (movimiento.esGasto == 1 ) {
        document.querySelector ("#gasto").checked = true
    } else {
        document.querySelector("#ingreso").checked = true
    }
}

function muestraMovimientos() {
    if (this.readyState === 4 && this.status === 200) {
        const respuesta = JSON.parse(this.responseText) 

        if (respuesta.status !== 'success') {
            alert("Se ha producido un error en la consulta de movimientos")
            return
        }

        losMovimientos = respuesta.movimientos
        const tbody = document.querySelector(".tabla-movimientos tbody")
        tbody.innerHTML = ""

        for (let i = 0; i < respuesta.movimientos.length; i++) {
            const movimiento = respuesta.movimientos[i]
            const fila = document.createElement("tr")
            fila.addEventListener("click", () => {
                detallaMovimiento(movimiento.id)
            })


            const dentro = `
                <td>${movimiento.fecha}</td>
                <td>${movimiento.concepto}</td>
                <td>${movimiento.esGasto ? "Gasto" : "Ingreso"}</td>
                <td>${movimiento.categoria ? categorias[movimiento.categoria] : ""}</td>
                <td>${movimiento.cantidad} €</td>
            `

            /* operador ternario de javascripts -> funciona como if -> ? ["verdadero"] : [ "falso"] */

            fila.innerHTML = dentro /* Creamos la fila*/
            
            tbody.appendChild(fila)

        }
    }
}


function llamaApiMovimientos(){
    xhr.open("GET", `http://localhost:5000/api/v1/movimientos`, true)
    xhr.onload = muestraMovimientos
    xhr.send()
}

function capturaFormMovimiento () {
    const movimiento = {}
    movimiento.fecha     = document.querySelector("#fecha").value
    movimiento.concepto  = document.querySelector("#concepto").value
    movimiento.categoria = document.querySelector("#categoria").value
    movimiento.cantidad  = document.querySelector("#cantidad").value
    if (document.querySelector("#gasto").checked) {
        movimiento.esGasto = 1
    } else {
        movimiento.esGasto = 0
    }
    return movimiento
}

function llamaApiModificaMovimiento(ev) {
    ev.preventDefault()
    id = document.querySelector("#idMovimiento").value
    if (!id) {
        alert ("Selecciona un movimiento antes!")
        return
    }

    const movimiento = capturaFormMovimiento()
    
    xhr.open('PUT',`http://localhost:5000/api/v1/movimiento/${id}`, true)
    xhr.onload = recibeRespuesta
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
    
    xhr.send(JSON.stringify(movimiento))
}

function llamaApiBorraMovimiento (ev) {
    ev.preventDefault()
    id = document.querySelector("#idMovimiento").value
    
    if (!id) {
        alert ("Selecciona un movimiento antes!")
        return
    }

    xhr.open('DELETE',`http://localhost:5000/api/v1/movimiento/${id}`, true)
    xhr.onload = recibeRespuesta
    xhr.send( )
}

function llamaApiCreaMovimiento (ev) {
    ev.preventDefault()
    const movimiento = capturaFormMovimiento()

    xhr.open('POST',`http://localhost:5000/api/v1/movimiento`, true)
    xhr.onload = recibeRespuesta
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
    
    xhr.send(JSON.stringify(movimiento))
}

window.onload = function() {
    llamaApiMovimientos()
    
    document.querySelector("#modificar")
        .addEventListener("click", llamaApiModificaMovimiento)
    
    document.querySelector ("#borrar")
        .addEventListener("click", llamaApiBorraMovimiento)
    
    document.querySelector ("#crear")
        .addEventListener("click", llamaApiCreaMovimiento)
}
