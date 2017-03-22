var express = require('express')
  ,	stylus = require('stylus')
  , config = require('config')
  , logger = require('morgan')
  , parser = require('body-parser')
  , nano = require('nano')(config.get('dbConfig.host'))
  , uuid = require('uuid/v1')
  , app = express()
  , hompage = require('jade').compileFile(__dirname + '/source/templates/homepage.jade')
  , ideas = require('jade').compileFile(__dirname + '/source/templates/ideas.jade')
  , list = require('jade').compileFile(__dirname + '/source/templates/list.jade')
  , contact = require('jade').compileFile(__dirname + '/source/templates/contact.jade')
  , confirmation = require('jade').compileFile(__dirname + '/source/templates/confirmation.jade')
  , errpage = require('jade').compileFile(__dirname + '/source/templates/error.jade')
  , details = require('jade').compileFile(__dirname + '/source/templates/details.jade') 
  , takers =  require('jade').compileFile(__dirname + '/source/templates/takers.jade')

app.use(logger('dev'))
app.use(express.static(__dirname + '/static'))
app.use(stylus.middleware({
    src: __dirname + "/source",
    dest: __dirname + "/static",
    debug: true,
    force: true,
}));
app.use(parser.urlencoded({
  extended: true
}));
app.use(parser.json());

var hackaton_db = nano.db.use(config.get('dbConfig.dbName'));

app.get('/', function (req, res, next) {
  try {
    var html = hompage({ title: 'Home' })
    res.send(html)
  } catch (e) {
    next(e)
  }
})

app.get('/taker', function (req, res, next) {
  try {
    var html = takers({ title: 'Biorę udział' })
    res.send(html)
  } catch (e) {
    next(e)
  }
})

app.post('/taker', function (req, res, next) {
	
	var data = { 
		attendee: req.body.name, 
	};
	
	hackaton_db.insert(data, uuid(), function(err, body){
	  if(err){
		var html = errpage({ title: 'Error' })
		res.send(html)
	  }else{
	  	var html = confirmation({ title: 'Confirmation' })
		res.send(html)
	  }
	});
})

app.get('/ideas', function (req, res, next) {
  try {
    var html = ideas({ title: 'Dodaj nowy projekt' })
    res.send(html)
  } catch (e) {
    next(e)
  }
})

app.post('/ideas', function (req, res, next) {
	
	var data = { 
		reporter: req.body.name, 
		title: req.body.title, 
		description: req.body.description
	};
	
	hackaton_db.insert(data, uuid(), function(err, body){
	  if(err){
		var html = errpage({ title: 'Error' })
		res.send(html)
	  }else{
	  	var html = confirmation({ title: 'Confirmation' })
		res.send(html)
	  }
	});
})

app.get('/list', function (req, res, next) {
	
	console.log(req.query.id);
	
	if(req.query.id == undefined){
		hackaton_db.list({include_docs: true}, function(err, body){
			if(!err){			
				var rows = body.rows;//the rows returned
				try {
					var html = list({ title: 'List', data: rows })
					res.send(html)
				} catch (e) {
					next(e)
				}
			}else{
				try {
					var html = errpage({ title: 'Error' })
					res.send(html)
				} catch (e) {
					next(e)
				}
			}
		});
	}else{
		hackaton_db.get(req.query.id, { revs_info: false, include_docs: true }, function(err, body) {
		  if (!err){
			try {
				console.log(body)
				var html = details({ title: 'Details', doc: body })
				res.send(html)
			} catch (e) {
				next(e)
			}
		  }
		});
	}
})

app.get('/contact', function (req, res, next) {
  try {
    var html = contact({ title: 'Contact' })
    res.send(html)
  } catch (e) {
    next(e)
  }
})



app.listen(process.env.PORT || config.get('appPort'), function () {
  console.log('localhost:' + (process.env.PORT || config.get('appPort')))
})
