var fs = require('fs')
, node = require('node');

createFile = function(dir) {
  var file = new node.fs.File();

  console.log(file + ' :: ' + dir);
  file.onError = function(method, errno, msg) {
    stderr.puts("An error occurred calling: " + method);
    stderr.puts(msg);
    node.exit(1);
  }

  file.open(dir, "w+");
  file.write('test');
  file.close();
}

exports.createFile = createFile;
