const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

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

/* Home Route */
app.get('/', (req, res) => {
	Article.find({}, (err, articles) => {
		if (err) {
			console.log(err);
		} else {
			res.render('index', {
				title: 'Articles',
				articles: articles
			});
		}
	});
});

/* Route GET single article */
app.get('/article/:id', (req, res) => {
	Article.findById(req.params.id, (err, article) => {
		res.render('article', {
			article: article
		});
	});
});

/* Route Add Article */
app.get('/articles/add', (req, res) => {
	res.render('add_article', {
		title: 'Add Article'
	});
});

/* Route Add Submit Post */
app.post('/articles/add', (req, res) => {
	let article = new Article();
	article.title = req.body.title;
	article.author = req.body.author;
	article.body = req.body.body;

	article.save(err => {
		if (err) {
			console.log(err);
			return;
		} else {
			res.redirect('/');
		}
	});
});

/* Route Load edit form */
app.get('/article/edit/:id', (req, res) => {
	Article.findById(req.params.id, (err, article) => {
		res.render('edit_article', {
			title: 'Edit',
			article: article
		});
	});
});

/* Route Update Submit Post */
app.post('/article/edit/:id', (req, res) => {
	let article = {};
	article.title = req.body.title;
	article.author = req.body.author;
	article.body = req.body.body;

	let query = { _id: req.params.id };

	Article.updateOne(query, article, err => {
		if (err) {
			console.log(err);
			return;
		} else {
			res.redirect('/');
		}
	});
});

/* Route Delete */
app.delete('/article/:id', (req, res) => {
	let query = { _id: req.params.id };

	Article.deleteOne(query, err => {
		if (err) {
			console.log(err);
		}
		res.send('Success');
	});
});

/* Start Server */
app.listen(3000, () => {
	console.log('Server running on port 3000...');
});
