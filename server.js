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
    res.redirect('/signin', 301)
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

var filetext = "var x = 5;";


      res.render('project.html', {
        locals: {
          content: CONTENT
          , sub: {
            projectname: doc.name
            , filename: file+'.'+format
            , creator: doc.creator
            , title: doc.name
            , textcontent: filetext
            , id: id
          }
        }
      })
    });
  })

  app.post('/join', function(req, res) {
    res.redirect('/project/'+req.body.proj_id);
  })

  app.post('/newfile/:id', function(req, res) {
    var id = req.params.id;
    var fileName = req.body.addfile.split('.');

    var fileConn = require('./lib/filehandle.js')
    , fileHandle = new FileHandle();

    fileHandle.createFile(__dirname + '/projects/' + req.body.project_name + '/' + fileName[0], fileName[1], 'This is the new file you created, '+fileName[0]+'.'+fileName[1]);

    res.redirect('/project/' + id + '/' + fileName[0] + '.' + fileName[1]);
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
