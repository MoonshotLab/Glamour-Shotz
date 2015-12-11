var config = require('../config')();
var needle = require('needle');

var share = function(files, next){

  var graphUrl = [
    'https://graph.facebook.com/v2.5/',
    config.FB_EVENT_ID,
    '/videos'
  ].join('');

  var postData = {
    access_token : config.FB_TOKEN,
    description  : ''
  };

  var gif;
  var video;
  var poster;

  // if it's a gif, build a description and put it in there
  files.forEach(function(file){
    if(file.indexOf('.gif') != -1) {
      gif = file;
    } else if(file.indexOf('.mp4') != -1) {
      video = file;
    } else if(file.indexOf('.jpg') != -1) {
      poster = file;
    }
  });

  if(video) postData.file_url = video;
  if(gif) postData.description = 'Gif: ' + gif + '\n';
  if(poster) postData.description += 'Poster: ' + poster;

  needle.post(graphUrl, postData, function(err, res){
    next(err, res);
  });
};


exports.share = share;
