'use strict'

var modelos = require('../models/modeling')
var typesEnabled = ['articulo', 'titulo','libro','capitulo']
var t = false
var typing = {}
var indexET = require('../public/index_estatuto.json')

exports.index = function(req, res) {
  res.render('index')
}

exports.searchParticular = function(req, res) {

  var type = req.params.type
  var number = req.params.number
  
    if(validType(type)){
      if(number !== 'todos') {
        modelos[type].findOne({number:number}, function(err, data) {          
          if(err) return fail(err, res)
          if(data) {            
            var index = indexET.indexOf(number) 
                           
            var next = indexET[index+1]
            var previus = indexET[index-1]   

            if(type == 'articulo') {
              res.json({
                libro: data,
                data: [data],
                links: { next: next, prev: previus}
              })
            }
            else res.json({ 
              libro: data,
              data: [data] 
            })
          }
          else return fail(err, res)
        })
      }
      else {
        modelos[type].find().exec(function(err, data) {          
          if(err) return fail(err, res)
          if(data) res.json({ type: type, data: data })        
        })
      }
    }
    else {
      var err = new Error('Página no encontrada.');
      err.status = 404;
      return fail(err, res);
    }

}

exports.addIssue = function(req, res) {
  modelos.issue.create(req.body, function(err){
    if(err) return fail(err, res)
  })
  res.send('done!')
}

exports.getIssues = function(req, res) {
  modelos.issue.find(function (err, i) {
    if (err) return console.error(err);
    res.json(i)
  })
}

exports.searchTypeArts = function(req, res) {
  var type = req.params.type == 'no-libro'? 'libro':req.params.type
  var number = req.params.number
  var v = validType(type), dd;

  if(v){
    var queryID = modelos[type].where({number:number})
    queryID.findOne(function(err, d) {
      if(d!= null && d.length !== 0) {
        var r = 'id_' + type
        dd = d
        modelos.articulo.find().where(r).equals(d.id).exec(callback)
      }
      else return fail(err, res)
    })
  }
  else return fail(err, res)

  function callback (err, data) {
    if(err) return fail(err, res)
    if(data!= null && data.length !== 0) {
      res.json({
        type: {
          id: dd.id,
          name: dd.name,
          number: dd.number
        },
        data: data
      })
    }
    else return fail(err, res)
  }
}

exports.searchType2 = function(req, res) {
  var type  = req.params.type,
    number  = req.params.number,
    number2   = req.params.number2,
    r = 'id_' + type;
  typing = []

  var queryLibro = modelos.libro.where({number:number})
  if(number2 !== 'todos') {
    queryLibro.findOne(buscarTitulo)
  }
  else {
    queryLibro.findOne(function(err, l) {
      typing.libro = l
      modelos.titulo.find({})
        .where(r).equals(l.id)
        .exec(enviarData)
    })
  }

  function buscarTitulo (err, l) {
    if(err) return fail(err, res)
    typing.libro = l
    if(l!= null && l.length !== 0) {
      modelos.titulo
        .findOne({})
        .where('id_' + type).equals(l.id)
        .where('number').equals(number2)
        .exec(buscarArticulos)
    }
    else return fail(err, res)
  }
  function buscarArticulos (err, t) {
    if(err) return fail(err, res)
    typing.titulo = t
    if(t!= null && t.length !== 0) {
      modelos.articulo.find({}).where({id_titulo: t._id })        
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
  var type  = req.params.type,
    number  = req.params.number,
    v   = validType(type),
    v2  = validType(type),
    type2   = req.params.type2,
    number2   = req.params.number2,
    type3   = req.params.type3,
    number3   = req.params.number3
  typing = []

  var queryIdLibro = modelos.libro.where({number:number})
  if(number3 !== 'todos') {
    queryIdLibro.findOne(buscarTitulo)
  }
  else {
    queryIdLibro.findOne(function(err, l) {
      typing.libro = l
      modelos.titulo.findOne({})
        .where('id_' + type).equals(l.id).where('number').equals(number2)
        .exec(function(err, t) {
        typing.titulo = t
        if(err) return fail(err, res)
          modelos.capitulo.find({})
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
      modelos.titulo
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
      modelos.capitulo
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
      modelos.articulo.find({}).where('number')
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
  modelos.articulo.create(req.body.art, function(err){
    if(err) return fail(err, res)
  })
  res.send('done!')
}

exports.addCapitulo = function(req, res) {
  modelos.capitulo.create({
    "number": 5,
    "name": "Impuesto a la Riqueza",
    "description": "Este impuesto fu� adicionado por Ley 1739 de 2014, el cual reemplaza al Impuesto al Patrimonio.",
    "id_titulo":"5526e4ba21190930078f41f3",
    "id_libro":"5523f4443a0ddf4412361714",
    "firstArt": 292,
    "lastArt": 298.8,
    "type":"capitulo"
  }, function(err){
    if(err) return fail(err, res)
  })
  res.send('done!')
}

exports.get_ids = function(req, res) {
  var ids = {}
  modelos.libro.find().select('number name id').exec(titulo)

  function titulo(err, l) {
    ids.id_libro = l
    modelos.titulo.find().select('number name id').exec(capitulo)
  }
  function capitulo(err, t) {
    ids.id_titulo = t
    modelos.capitulo.find().select('number name id').exec(enviarData)
  }
  function enviarData(err, c) {
    ids.id_capitulo = c
    res.json(ids)
  }
}

exports.search = function(req, res) {
  
  var k = new RegExp(req.query.key, "ig")
  
  var parameters = [{name: k},{description: k},{number: k}]

  modelos.articulo.find().or(parameters).exec(function(err, data) {
    if(err) return fail(err, res)
    res.json({
      parameter: req.query.key,
      data: data
    })
  })
  
}

exports.renderPUG = function(req, res) {
  var name = req.params.name
  var sub = req.params.sub
  res.render('templates/' + sub+ '/'+name)
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
