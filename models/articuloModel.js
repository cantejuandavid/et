var Schema = require('mongoose').Schema

var art_schema = new Schema({
	type				: {type: String, default: 'articulo'},
	number				: String,
	name 				: String,
	description 		: String,		
	id_capitulo			: String,
	id_titulo			: String,
	id_libro			: String,
	history				: Object,
	centerTitle			: {type: Boolean, default: false},
	title 				: String,
	created 			: {type: Date, default: Date.now},
	lastUpdated			: {type: Date, default: Date.now}
})

module.exports = art_schema
