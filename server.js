var sys = require('sys');

process.addListener('uncaughtException', function(err, stack) {
  console.log('---------------');
  console.log('Exception: ' + err);
  console.log(err.stack);
  console.log('---------------');
})

var express = require('express')
, app = express.createServer()
, fs = require('fs');

app.register('.haml', require('hamljs'));

app.set('views', __dirname + '/public');

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

  var file = new fs.ReadStream(__dirname+'/vendor/test.txt'); 

  res.writeHead(200, {
    'Content-Type': 'application/x-javascript'
  });

  res.write(file.toString());

  gzip(__dirname+'/vendor/test.txt', 'binary', function(err, data){
    var buf = new Buffer(256)
    , len = buf.write(data.toString());

    sys.puts(len);
  });

  res.write(user);
  res.end();
})

app.listen(3232);
