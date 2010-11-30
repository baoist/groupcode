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
, CONTENT = '#body';

var app = module.exports = express.createServer();

/*
app.get('/', function(req, res){
  res.redirect('/signin');
});

app.get('/signin', function(req, res) {
  res.render('index.haml', {
    layout: 'layout.haml'
    , locals: {
      title: 'SoCode - Sign In'
    }
  });
});

app.get('/projects/:user', function(req, res) {
  var user = req.params.user;

  var gzip = require('gzip').gzip;

  var file = new fs.ReadStream(__dirname+'/vendor/test.txt', {encoding: 'utf8'}); 

  res.writeHead(200, {
    'Content-Type': 'text/plain'
  });

  var te = fs.readFile(__dirname+'/vendor/test.txt', {encoding: 'utf8'}, function(err, data) {
    if(err) throw err;

    console.log(data.toString);
  })

  console.log(te);

  gzip(__dirname+'/vendor/test.txt', 'binary', function(err, data){
    var buf = new Buffer(256)
    , len = buf.write(data.toString());

    sys.puts(len);
  });

  res.write(user);
  res.end();
})
*/

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
    yui2: '/yui2/',
    yui3: '/yui3/'
  });

  app.get('/', function(req, res) {
    res.redirect('/signin');
  })

  app.get('/signin', function(req, res) {
    res.render('index.html', {
      locals: {
        content: CONTENT
      }
    })
  })
})

app.listen('3232');
