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
    res.redirect('/signin/'+req.body.name);
  })

  app.get('/signin/:name', function(req, res) {
    var name = 't1'// req.body.name
    , dbConn = require('./lib/db.js')
    , projects = new GetProjects('localhost', 27017).findByUser(name, function(err, docs) {
      
      var proj = []
      , heading
      , status;

      for(var j = 0; j < docs.length; j++) {
        proj.push('{ name: ' + docs[j].name + ', location: ' + docs[j].location + '}');
      }

      console.log(proj.length);

      if(proj.length > 0) {
        heading = 'Create or select a project.'
        status = 'closed'
      } else {
        heading = 'Please create a project or enter the project id you wish to join.'
        status = 'open'
      }

      res.render('projlist.html', {
        locals: {
          content: CONTENT
          , sub: {
            test: proj
            , proj_result_list: heading
            , state: status
            , username: name
          }
        }
      })
    });
  })

  app.get('/save', function(req, res) {
    var self = this;

    var dbConn = require('./lib/db.js')
    , projects = GetProjects('localhost', PORT);

    GetProjects.save({
      creator: 'baoist'
      , contributors: 'jakedahn'
      , name: 'socode_dummy_project'
      , location: '/public/projects/test'
    }, function(err, docs) {
      self.redirect('/signin');
    })
  })
})

app.listen(PORT);
