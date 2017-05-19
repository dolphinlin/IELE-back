var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs  = require('express-handlebars');

var index = require('./routes/index');
var users = require('./routes/users');
var apis = require('./routes/apis');
var admin = require('./routes/admin');

var session = require('express-session')
var busboy = require('./modules/express-busboy')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
var hbs = exphbs.create({
    // Specify helpers which are only registered on this instance.
    defaultLayout: '_admin',
    helpers: {
        if_neq: function (a, b, opts) {
          if(a != b){
            return opts.fn(this);
          } else {
            return opts.inverse(this);
          }
        },
        plusOne: function (number) {
          return number + 1
        },
        procPath: function (path) {
          let tmpPath = path.split('/')
          return tmpPath[1] + '/' + tmpPath[2]
        },
        procName: function (path) {
          let tmpPath = path.split('/')[2]
          return tmpPath.split('.')[0]
        },
        procJournal: function(path) {
          return path.split('/').slice(1).join('/')
        }
    }
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-CSRF-Token");
  next();
})
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(busboy())

app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'tvetvetvetvetvetvtetetete',
  resave: true,
  saveUninitialized: true
}));

app.use('/', index);
app.use('/users', users);
app.use('/apis', apis);
app.use('/admin', (req, res, next) => {
  // req.session.type = 1 // test
  if (req.session.logined === false) {
    res.redirect('/')
  } else {
    next()
  }
}, admin);

app.use('*', (req, res, next) => {
  res.status(400)
    .json({
      success: false,
      msg: 'the route not found.'
    })
})


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.log(err)
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
