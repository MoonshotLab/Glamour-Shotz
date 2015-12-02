var Q = require('q');
var path = require('path');
var knox = require('knox');
var config = require('../config')();

var s3Client = knox.createClient({
  key     : config.S3_KEY,
  secret  : config.S3_SECRET,
  bucket  : config.S3_BUCKET
});



var remember = function(files){
  var deferred = Q.defer();

  var remotePaths = [];
  var putIt = function(file){
    var relativePath  = file.replace(process.cwd(), '');
    var extension     = path.extname(file);
    var remoteFile    = path.dirname(
      path.normalize(
        relativePath.replace('tmp', '')
      )).replace('/', '') + extension;
    var remotePath    = [
      'http://s3.amazonaws.com',
      config.S3_BUCKET,
      remoteFile
    ].join('/');

    // upload to s3
    s3Client.putFile(file, remoteFile, function(err, res){
      remotePaths.push(remotePath);

      // recurse or be done
      i++;
      if(files[i]) putIt(files[i]);
      else deferred.resolve(remotePaths);
    });
  };

  var i = 0;
  putIt(files[i]);

  return deferred.promise;
};


exports.remember = remember;
