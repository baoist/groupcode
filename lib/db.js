var Db = require('mongodb/db').Db
, ObjectID = require('mongodb/bson/bson').ObjectID
, Server = require('mongodb/connection').Server;

GetProjects = function(host, port) {
  this.db = new Db('socode', new Server(host, port, {auto_reconnect: true}, {}));
  this.db.open(function(){});
};

GetProjects.prototype.getCollection = function(callback) {
  this.db.collection('socode', function(error, socode_proj) {
    if( error ) callback(error);
    else callback(null, socode_proj);
  });
};

GetProjects.prototype.findAll = function(callback) {
  this.getCollection(function(error, socode_proj) {
    if( error ) callback(error)
    else {
      socode_proj.find(function(error, cursor) {
        if( error ) callback(error)
        else {
          cursor.toArray(function(error, results) {
            if( error ) callback(error)
            else callback(null, results)
          });
        }
      });
    }
  });
};

GetProjects.prototype.findByUser = function(username, callback) {
  this.getCollection(function(error, socode_proj) {
    if( error ) callback(error)
    else {
      socode_proj.find({creator: username}, function(error, cursor) {
        if( error ) callback(error)
        else {
          cursor.toArray(function(error, results) {
            if( error ) callback(error)
            else callback(null, results)
          })
        }
      });
    }
  });
};

GetProjects.prototype.findById = function(id, callback) {
  this.getCollection(function(error, socode_proj) {
    if( error ) callback(error)
    else {
      socode_proj.findOne({_id: parseInt(id)}, function(error, result) {
        if( error ) callback(error)
        else callback(null, result)
      });
    }
  });
};

GetProjects.prototype.save = function(projects, callback) {
    var self = this;

    this.getCollection(function(error, socode_proj) {
      if( error ) callback(error)
      else {
        if( typeof(projects.length)=="undefined")
          projects = [projects];

        self.findAll(function(err, docs) {
          for( var i = 0; i< projects.length; i++ ) {
            project = projects[i];
            project.created_at = new Date();
            project._id = docs.length + 1; // turns id into 1, 2, 3 - auto inc starting from 1.
          }

          socode_proj.insert(projects, function() {
            callback(null, projects);
          });
        })    
      }
    });
};

exports.GetProjects = GetProjects;
