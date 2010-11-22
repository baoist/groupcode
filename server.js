process.addListener('uncaughtException', function(err, stack) {
  console.log('---------------');
  console.log('Exception: ' + err);
  console.log(err.stack);
  console.log('---------------');
})

var express = require('express'),
  app = express.createServer();

app.get('/', function(req, res){
});

app.get('/projects/:user', function(req, res) {
  var user = req.params.user;

  console.log(user);
})

app.listen(3232);
