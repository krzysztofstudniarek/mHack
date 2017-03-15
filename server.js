var express = require('express')
  ,	stylus = require('stylus')
  , logger = require('morgan')
  , parser = require('body-parser')
  , nodemailer = require('nodemailer')
  , app = express()
  , hompage = require('jade').compileFile(__dirname + '/source/templates/homepage.jade')
  , ideas = require('jade').compileFile(__dirname + '/source/templates/ideas.jade')
  , about = require('jade').compileFile(__dirname + '/source/templates/about.jade')
  , contact = require('jade').compileFile(__dirname + '/source/templates/contact.jade')
  , confirmation = require('jade').compileFile(__dirname + '/source/templates/confirmation.jade')
  , errpage = require('jade').compileFile(__dirname + '/source/templates/error.jade')


app.use(logger('dev'))
app.use(express.static(__dirname + '/static'))
app.use(stylus.middleware({
    src: __dirname + "/source",
    dest: __dirname + "/static",
    debug: true,
    force: true,
}));
app.use(parser());

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'mhackaton@gmail.com',
        pass: process.argv[2]
    }
});

app.get('/', function (req, res, next) {
  try {
    var html = hompage({ title: 'Home' })
    res.send(html)
  } catch (e) {
    next(e)
  }
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
	
	let mailOptions = {
		from: req.body.name,
		to: 'krzysztofstudniarek@gmail.com',
		subject: '[HACKATON]'+req.body.title,
		text: req.body.description,
		html: req.body.description
	};

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			var html = errpage({ title: 'Error' })
			res.send(html)
			return console.log(error);
		}
		
		var html = confirmation({ title: 'Potwierdzenie' })
		res.send(html)
		console.log('Message %s sent: %s', info.messageId, info.response);
	});	
})

app.get('/about', function (req, res, next) {
  try {
    var html = about({ title: 'About' })
    res.send(html)
  } catch (e) {
    next(e)
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



app.listen(process.env.PORT || 3000, function () {
  console.log('localhost:' + (process.env.PORT || 3000))
})