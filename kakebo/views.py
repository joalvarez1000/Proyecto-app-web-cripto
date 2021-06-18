import sqlite3
from flask import json, jsonify, render_template, request
from kakebo import app
from kakebo.dataaccess import DBmanager
from http import HTTPStatus


dbManager = DBmanager(app.config.get("DATABASE"))

@app.route ("/")
def listaMovimientos (): 
    return render_template ("spa.html")

@app.route ("/api/v1/movimientos")
def movimientos ():
    query = "SELECT * FROM movimientos ORDER BY fecha;"
   
    try:
       lista = dbManager.consultaMuchasSQL (query) 
       return jsonify ({'status': 'success', 'movimientos': lista})
    except sqlite3.Error as e:
        return jsonify({'status':'fail', 'mensaje': str(e)})

@app.route('/api/v1/movimiento/<int:id>', methods=['GET', 'PUT', 'DELETE'])
@app.route('/api/v1/movimiento', methods=['POST'])
def detalleMovimiento(id=None):
    
    try:
        if request.method in ('GET', 'PUT', 'DELETE'):
            movimiento = dbManager.consultaUnaSQL("SELECT * FROM movimientos WHERE id = ?", [id])
        
        if request.method == 'GET':
            if movimiento:
                return jsonify({
                    "status" : "success",
                    "movimiento" : movimiento
                })
            else:
                return jsonify({"status": "fail", "mensaje":"movimiento no encontrado"}), HTTPStatus.NOT_FOUND #para que aparezca el error 404 not found

        if request.method == 'PUT':
            dbManager.modificaTablaSQL("""
                UPDATE movimientos 
                SET fecha=:fecha, concepto=:concepto, esGasto=:esGasto, categoria=:categoria, cantidad=:cantidad 
                WHERE id = {}""".format(id), request.json)
            
            return jsonify ({"status":"success", "mensaje": "registro modificado"})
        
        if request.method == 'DELETE':
            dbManager.modificaTablaSQL("""
                DELETE FROM movimientos 
                WHERE id = ?""", [id])

            return jsonify({"status": "success", "mensaje": "registro borrado"})

        if request.method == 'POST':
            dbManager.modificaTablaSQL("""
                INSERT INTO movimientos 
                       (fecha, concepto, esGasto, categoria, cantidad)
                VALUES (:fecha, :concepto, :esGasto, :categoria, :cantidad) 
                """, request.json)
            return jsonify({"status": "success", "mensaje": "registro creado"}), HTTPStatus.CREATED


    except sqlite3.Error as e:
        return jsonify ({"status":"fail", "mensaje" : "Error en la base de datos: {}".format(e)}), HTTPStatus.BAD_REQUEST
