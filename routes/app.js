'use strict'

var m = require('../models/modeling'),
	typesEnabled = ['articulo', 'titulo','libro','capitulo'],
	t = false,
	typing = {}
var indexEstatuto = require('../public/index_estatuto.json')
exports.auth = function(req, res, next) {	
	if(!req.session.username)
		res.render('login')
	else next()
}

exports.index = function(req, res) {

	res.render('index')	
}

exports.render = function(req, res) {
	var name = req.params.name
	var sub = req.params.sub	
	res.render('templates/' + sub+ '/'+name)
}

exports.searchParticular = function(req, res) {			
	var type = req.params.type
	var number = req.params.number
	var v = validType(type)	
	if(v){
		if(number !== 'todos') {
			m[type].findOne({number:number}, function(err, data) {			
				if(err) return fail(err, res)
				if(data!= null && data.length !== 0) {
					var index = indexEstatuto.indexOf(data.number.toString())
					var next = indexEstatuto[index+1]
					var previus = indexEstatuto[index-1]
					if(data.type == 'articulo') {
						res.json({
							libro: data,
							data: [data],
							links: {
								next: next,
								prev: previus
							}
						})
					}
					else
					{
						res.json({
							libro: data,
							data: [data]
						})
					}
					
				}
				else
					return fail(err, res)
			})
		}
		else {		
			m[type].find().exec(function(err, data) {
				if(err) return fail(err, res)							
				if(data!= null && data.length !== 0) {
					res.json({
						type: type,
						data: data
					})
				}
				else	
					return fail(err, res)
			})
		}
	}		
	else
		return fail(err, res)

}

exports.searchTypeArts = function(req, res) {
	var type = req.params.type == 'no-libro'? 'libro':req.params.type
	var number = req.params.number
	var v = validType(type)	

	if(v){
		var queryID = m[type].where({number:number})
		queryID.findOne(function(err, d) {
			if(d!= null && d.length !== 0) {										
				var r = 'id_' + type
				m.articulo.find().where(r).equals(d.id).exec(function(err, data) {
					if(err) return fail(err, res)	
					if(data!= null && data.length !== 0) {						
						res.json({
							type: {
								id: d.id,
								name: d.name,
								number: d.number
							},
							data: data
						})
					}
					else	
						return fail(err, res)			
				})			
			}	
			else return fail(err, res)				
		})
	}	
	else
		return fail(err, res)			
}

exports.searchType2 = function(req, res) {
	var type 	= req.params.type,
		number 	= req.params.number,	
		number2 	= req.params.number2,
		r = 'id_' + type
	typing = []

	var queryLibro = m.libro.where({number:number})
	if(number2 !== 'todos') {		
		queryLibro.findOne(buscarTitulo)
	}	
	else {		
		queryLibro.findOne(function(err, l) {	
			typing.libro = l				
			m.titulo.find({})
				.where(r).equals(l.id)
				.exec(enviarData)
		})
	}

	function buscarTitulo (err, l) {
		if(err) return fail(err, res)
		typing.libro = l
		if(l!= null && l.length !== 0) {										
			m.titulo
				.findOne({})
				.where('id_' + type).equals(l.id).where('number').equals(number2)
				.exec(buscarArticulos)			
		}	
		else return fail(err, res)
	}
	function buscarArticulos (err, t) {			
		if(err) return fail(err, res)
		typing.titulo = t
		if(t!= null && t.length !== 0) {				
			m.articulo.find({}).where('number')
				.gt((t.firstArt-1) + 0.9)
				.lt(Math.round(t.lastArt+1))		
				.exec(enviarData)	
		}
		else return fail(err, res)
	}
	function enviarData (err, a) {			
		if(err) return fail(err, res)
		typing.articulos = a
		if(a!= null && a.length !== 0) {					
			res.json({
				libro: typing.libro,
				titulo: typing.titulo,
				data: a
			})
		}
		else return fail(err, res)
	}
}

exports.searchType3 = function(req, res) {
	var type 	= req.params.type,
		number 	= req.params.number,
		v 	= validType(type),
		v2	= validType(type),	
		type2 	= req.params.type2,
		number2 	= req.params.number2,
		type3 	= req.params.type3,
		number3 	= req.params.number3
	typing = []
	
	var queryIdLibro = m.libro.where({number:number})
	if(number3 !== 'todos') {
		queryIdLibro.findOne(buscarTitulo)
	}	
	else {		
		queryIdLibro.findOne(function(err, l) {	
			typing.libro = l
			m.titulo.findOne({})
				.where('id_' + type).equals(l.id).where('number').equals(number2)
				.exec(function(err, t) {
				typing.titulo = t
				if(err) return fail(err, res)			
					m.capitulo.find({})
						.where('id_' + type2).equals(t.id)
						.exec(function(err,c){
							typing.capitulo = c
							enviarData(err, c)
						})																
				})
		})
	}

	function buscarTitulo(err, l) {				
		if(err) return fail(err, res)
		typing.libro = l																	
		if(l!= null && l.length !== 0) {						
			m.titulo
				.findOne({})
				.where('id_' + type).equals(l.id).where('number').equals(number2)
				.exec(buscarCapitulo)			
		}	
		else return fail(err, res)		
	}
	function buscarCapitulo(err, t) {			
		if(err) return fail(err, res)
		typing.titulo = t																	
		if(t!= null && t.length !== 0) {														
			m.capitulo
				.findOne({})
				.where('id_' + type2).equals(t.id).where('number').equals(number3)
				.exec(buscarArticulos)							
		}
		else return fail(err, res)			
	}
	function buscarArticulos (err, c) {			
		if(err) return fail(err, res)
		typing.capitulo = c
		if(c!= null && c.length !== 0) {							
			m.articulo.find({}).where('number')
				.gt((c.firstArt-1) + 0.9)
				.lt(Math.round(c.lastArt+1))		
				.exec(enviarData)	
		}
		else return fail(err, res)
	}
	function enviarData(err, data) {
		if(err) return fail(err, res)			
		if(data!= null && data.length !== 0) {					
			res.json({
				libro:  typing.libro,
				titulo: typing.titulo,
				capitulo: typing.capitulo,
				data: data
			})
		}
		else return fail(err, res)
	}
}

exports.addart = function(req, res) {		
	m.articulo.create(req.body.art, function(err){
		if(err) return fail(err, res)
	})
	res.send('done!')
}

function validType(type) {
	for(var i = 0; i < typesEnabled.length; i++) {
		if(type == typesEnabled[i]) {
			return true
		}
	}
	return false
}

function fail(err, res) {
	res.json({
		error: true,
		err: err,
		message: 'No se ha encontrado lo que intenta buscar.'		
	})	
}

exports.get_ids = function(req, res) {	
	var ids = {}
	m.libro.find().select('name id').exec(titulo)

	function titulo(err, l) {
		ids.id_libro = l
		m.titulo.find().select('name id').exec(capitulo)
	}
	function capitulo(err, t) {
		ids.id_titulo = t
		m.capitulo.find().select('name id').exec(enviarData)		
	}
	function enviarData(err, c) {
		ids.id_capitulo = c
		res.json(ids)
	}
}

exports.search = function(req, res) {
	var key = req.body.key
	var k = new RegExp(key, "i")
	var forNumber = parseFloat(key.replace(/\D/g,''))
	var parameters = [{name: k},{description: k}]
	
	if(!isNaN(forNumber)) {		
		for(var i = 0; i < 13; i++) {			
			var a = Number(forNumber)+'.'+ i			
			parameters.push({number:a})
		}
	}	
	m.articulo.find().or(parameters).exec(function(err, data) {
		if(err) return fail(err, res)
		res.json({parameter: key, data:data})
	})
}