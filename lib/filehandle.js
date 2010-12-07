var fs = require('fs');

FileHandle = function() {
  console.log('--- STARTED HANDLING FILES ---');
}

FileHandle.prototype.createFile = function(dir, ext, msg) {
  var file = fs.createWriteStream(dir + '.' + ext, {
    'flags': 'w'
    , 'encoding': null
    , 'mode': 0666
  })
  
  file.onError = function(method, errno, msg) {
    stderr.puts("An error occurred calling: " + method);
    stderr.puts(msg);
    node.exit(1);
  }

  if(msg) {
    file.write(msg);
  }

  file.end();

  this.fileFinished();
}

FileHandle.prototype.createDir = function(dir) {
  var self = this;

  fs.mkdir(dir, 0777, function(err) {
    if (err) throw err
    else {
      self.createFile(dir + 'readme', 'txt', 'This is an example readme. I will not allow you to delete this because I am an asshole.');
    }
  });
}

FileHandle.prototype.fileFinished = function() {
  console.log('--- FILE HANDLED ---');
}

exports.FileHandle = FileHandle;
