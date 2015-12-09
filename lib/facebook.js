var config = require('../config')();
var needle = require('needle');

var share = function(files, next){

  var graphUrl = [
    'https://graph.facebook.com/v2.5/',
    config.FB_EVENT_ID,
    '/videos'
  ].join('');

  var postData = { access_token : config.FB_TOKEN };

  // if it's a gif, build a description and put it in there
  files.forEach(function(file){
    if(file.indexOf('.gif') != -1) {
      postData.description = 'Get your GIF on - ' + file;
    } else { postData.file_url = file; }
  });

  needle.post(graphUrl, postData, function(err, res){
    next(err, res.body);
  });
};


exports.share = share;
