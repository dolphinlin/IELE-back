var express = require('express');
var router = express.Router();

var Admin = require('../models/admin');
var AdminLogin = Admin.Login;

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.session.logined) {
    res.redirect('/admin')
  } else {
    res.render('admin/login', { layout: 'main' });
  }
});

router.post('/login', (req, res, next) => {
  let {user, password} = req.body

  AdminLogin(user, password)
    .then((result) => {
      req.session.logined = true
      req.session.type = result[0].type
      res.redirect('/admin')
    })
    .catch((err) => {
      console.log(err)
      req.session.logined = false
      res.redirect('/')
    })
})

module.exports = router;
