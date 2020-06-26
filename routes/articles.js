const express = require('express');
const router = express.Router();

/* Bring in Articles Model */
let Article = require('../models/article');

/* Bring in User Model */
let User = require('../models/user');

/* Route Add Article */
router.get('/add', checkAuthenticated, (req, res) => {
  res.render('add_article', {
    title: 'Add Article'
  });
});

/* Route Add Submit Post */
router.post('/add', (req, res) => {
  req.checkBody('title', 'Title is required').notEmpty();
  // req.checkBody('author', 'Author is required').notEmpty();
  req.checkBody('body', 'Body is required').notEmpty();

  // Get Errors
  let errors = req.validationErrors();
  if (errors) {
    res.render('add_article', {
      title: 'Add Article',
      errors: errors
    });
  } else {
    let article = new Article();
    article.title = req.body.title;
    article.author = req.user._id;
    article.body = req.body.body;

    article.save((err) => {
      if (err) {
        console.log(err);
        return;
      } else {
        req.flash('success', 'Article added');
        res.redirect('/');
      }
    });
  }
});

/* Route Load edit form */
router.get('/edit/:id', (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    if (!req.user || article.author != req.user._id) {
      req.flash('danger', 'You are not authorized to edit this article');
      res.redirect('/');
    } else {
      res.render('edit_article', {
        title: 'Edit',
        article: article
      });
    }
  });
});

/* Route Update Submit Post */
router.post('/edit/:id', checkAuthenticated, (req, res) => {
  let article = {};
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  let query = { _id: req.params.id };

  Article.updateOne(query, article, (err) => {
    if (err) {
      console.log(err);
      return;
    } else {
      req.flash('success', 'Article Updated');
      res.redirect('/');
    }
  });
});

/* Route Delete */
router.delete('/:id', (req, res) => {
  if (!req.user._id) {
    res.status(500).send();
  }
  let query = { _id: req.params.id };
  Article.findById(req.params.id, (err, article) => {
    if (article.author != req.user._id) {
      res.status(500).send();
    } else {
      Article.deleteOne(query, (err) => {
        if (err) {
          console.log(err);
        }
        res.send('Success');
      });
    }
  });
});

/* Route GET single article */
router.get('/:id', (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    User.findById(article.author, (err, user) => {
      res.render('article', {
        article: article,
        author: user.name
      });
    });
  });
});

/* Access Control */
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash('danger', 'Login required!');
    res.redirect('/users/login');
  }
}
module.exports = router;
