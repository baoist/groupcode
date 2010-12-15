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
    var name = req.params.name
    , dbConn = require('./lib/db.js')
    , projects = new GetProjects('localhost', 27017).findByUser(name, function(err, docs) {
      var proj = ''
      , heading
      , status;

      for(var j = 0; j < docs.length; j++) {
        // proj.push('{ name: ' + docs[j].name + ', location: ' + docs[j].location + ' }');
        proj += '<div class="proj_sect"><a href="/project/'+ docs[j]._id +'/readme.txt">'+ docs[j].name +'</a></div>';
      }

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

  app.post('/save', function(req, res) {
    var self = this;

    var dbConn = require('./lib/db.js')
    , projects = new GetProjects('localhost', 27017);

    projects.save({
      creator: req.body.username
      , name: req.body.project_name
      , location: '/projects/'+req.body.project_name
    }, function(err, docs) {
      var fileConn = require('./lib/filehandle.js')
      , fileHandle = new FileHandle();

      fileHandle.createDir(__dirname + '/projects/' + req.body.project_name + '/');

      res.redirect('/project/' + docs[0]._id + '/readme.txt');
    })
  })

  app.get('/project/:id/:file?.:format?', function(req, res) {
    var self = this
    , id = req.params.id
    , file = req.params.file
    , format = req.params.format;

    if(file != undefined && format === undefined) {
      file = 'readme'
      , format = 'txt';
    } else if(file === undefined && format === undefined) {
      file = 'readme'
      , format = 'txt';
    }

    var dbConn = require('./lib/db.js')
    , projects = new GetProjects('localhost', 27017).findById(id, function(err, doc) {
      /*
      require('./lib/filerw.js')
      , rw = new rw();

      console.log(rw);

      var foo = rw.readInp(__dirname + doc.location + '/' + file + '.' + format);

      console.log(foo)
      */

      res.render('project.html', {
        locals: {
          content: CONTENT
          , sub: {
            projectname: doc.name 
            , filename: file+'.'+format
            , filetext: 'BINARY SOLO! 00101 01010101001 0101 010 10 010  1 100 101 010 10 10  \n 1010 10 10 10 10 01 10 01 01 01 01 01 01 01 01 010 10 10 01 01 010101010 101 01 01 01 0 101 01010101010 01 01011 010 10 10 1001 01 01 01 0101 01 010 10 10 1010100101 01 01 0 1010 10  010101 01 010 101 01 01 01 01 01 010 10 01 01 01 0 101 01 0 10 10 101 01 01 010 10 10 01 01 01 010 101 01 01 01 010 10 10 110 1 1 01 0 10 1 10010'
            , format: format
          }
        }
      })
    });
  })

  app.get('/*', function(req, res) {
    res.render('404.html', {
      locals: {
        content: CONTENT
        , sub: {
          title: '404'
        }
      }
    })
  })
})

app.listen(PORT);
