const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/db');

mongoose.connect('mongodb://localhost/nodekb');
let db = mongoose.connection;

/* Check connection */
db.once('open', () => {
	console.log('Connected to MongoDB');
});

/* Check DB Errors */
db.on('error', err => {
	console.log(err);
});

/* Init App */
const app = express();

/* Load Models */
let Article = require('./models/article');
let User = require('./models/user');

/* Load View Engine */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

/* Body-Parser middleware */
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

/* Set Public folder */
app.use(express.static(path.join(__dirname, 'public')));

/* Express Session Middleware */
app.use(
	session({
		secret: 'keyboard cat',
		resave: true,
		saveUninitialized: true
		// cookie: { secure: true }
	})
);

/* Express Message Middleware */
app.use(require('connect-flash')());
app.use(function(req, res, next) {
	res.locals.messages = require('express-messages')(req, res);
	next();
});

/* Express Validator Middleware */
app.use(
	expressValidator({
		errorFormatter: (param, msg, value) => {
			let namespace = param.split('.'),
				root = namespace.shift(),
				formParam = root;

			while (namespace.length) {
				formParam += '[' + namespace.shift() + ']';
			}
			return {
				param: formParam,
				msg: msg,
				value: value
			};
		}
	})
);

// Passport Config
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

app.get('*', (req, res, next) => {
	res.locals.user = req.user || null;
	next();
});

/* Home Route */
app.get('/', (req, res) => {
	Article.find({}, (err, articles) => {
		if (err) {
			console.log(err);
		} else {
			User.find({}, (err, users) => {
				res.render('index', {
					title: 'Articles',
					articles: articles,
					users: users
				});
			});
		}
	});
});

/* Route Files */
let articles = require('./routes/articles');
let users = require('./routes/users');

app.use('/articles', articles);
app.use('/users', users);

/* Start Server */
app.listen(3000, () => {
	console.log('Server running on port 3000...');
});
