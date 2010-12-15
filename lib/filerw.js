var fs = require('fs');

rw = function() {
  console.log('-- started r/w --');
}

rw.prototype.readInp = function(path) {
  console.log(path);
  console.log('read')
  var foo = fs.watchFile(path, {
    'encoding': 'UTF-8'
  }, function(curr, prev) {
    /*
    fs.readFile(path, function(err, data) {
      if (err) throw err;
      var buf = new Buffer(256)
      , len = buf.write(data, 0);

      console.log(len + " bytes: " + buf.toString('utf8', 0, len))
      console.log(data);
      return data;
    })
    */

    fs.open(path,'r',0666,function(err,fd) {
      fs.read(fd,10000,null,'utf8',function(err,str,count) {
        fs.close(fd);
        console.log(str);
        return str;
      });
    });
  });
}

rw.prototype.writeInp = function(path) {
  console.log(path);
  console.log('write');
}

exports.rw = rw;
