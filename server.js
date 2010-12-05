var sys = require('sys');

process.addListener('uncaughtException', function(err, stack) {
  console.log('---------------');
  console.log('Exception: ' + err);
  console.log(err.stack);
  console.log('---------------');
})

var express = require('express')
, extras = require('express-extras')
, fs = require('fs')
, YUI = require('yui3').YUI
, CONTENT = '#body'
, PORT = '3232';

var app = module.exports = express.createServer();

YUI({ debug: false }).use('express', 'node', function(Y) {
  app.configure(function(){
    app.use(extras.fixIP());
    app.use(extras.throttle({ holdTime: 5 }));

    // app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
    app.use(express.logger());
    app.use(express.methodOverride());
    app.use(express.bodyDecoder());
    app.use(express.cookieDecoder());        
    app.use(express.conditionalGet());
    app.use(express.cache());
    app.use(express.gzip());        
    app.use(express.staticProvider(__dirname + '/public'));
    app.use(app.router);
    app.set('views', __dirname + '/public');
  });
  
  app.get('/combo', YUI.combo);

  app.register('.html', YUI);

  YUI.partials = [
    {
      name: 'includes'
      , node: 'head'
    }
  ]

  YUI.configure(app, {
    yui2: '/yui2/'
    , yui3: '/yui3/'
  });

  app.get('/', function(req, res) {
    res.render('signin.html', {
      locals: {
        content: CONTENT
      }
    })
  })

  app.get('/signin', function(req, res) {
    var TITLE = 'Sign in page';

    res.render('signin.html', {
      locals: {
        content: CONTENT
        , after: function(Y, options, partial) {
          Y.one('title').set('innerHTML', TITLE);
        }
      }
    })
  })

  app.post('/signin', function(req, res) {
    var dbConn = require('./lib/db.js')
    , projects = new GetProjects('localhost', PORT);

    console.log(projects);
    // gets the name of the user.
    var name = req.body.name;
  })
})

app.listen(PORT);
