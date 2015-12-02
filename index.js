var fs = require('fs');
var path = require('path');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var camera = require('./lib/camera');
var phidget = require('./lib/phidget');
var video = require('./lib/video');

// handle app state
var filters       = [];
var inActiveMode  = false;



// config express
app.use(express.static('public'));
app.set('view engine', 'jade');
server.listen(process.env.PORT || '3000');



// connect camera and listen for events
camera.connect();

camera.events.on('connected', function(){
  io.sockets.emit('camera', { status : 'ready'});
});

camera.events.on('recording', function(){
  io.sockets.emit('camera', { status : 'recording'});
});

camera.events.on('done-recording', function(){
  // create an output directory
  var outputDir = path.join(process.cwd(), 'tmp', new Date().getTime().toString());
  fs.mkdirSync(outputDir);

  // necessary to give the camera enough time to "stop recording"
  setTimeout(function(){
    camera.writeLastVideoToDisk(outputDir, function(filePath){
      video.optimize(outputDir, filters);
      io.sockets.emit('camera', { status : 'ready' });

      // reset the active mode and filters to allow continual use while
      // the video optimization processes in the background
      inActiveMode  = false;
      filters       = [];
    });
  }, 2500);

  io.sockets.emit('camera', { status : 'done-recording' });
});



// events from interface
io.on('connection', function(socket) {
  // listen for countdown completion from the client before recording start
  socket.on('countdown-done', function(){
    camera.takeVideo();
  });
});



// publish video processing steps to the interface
video.events.on('step', function(data){
  data.status = 'processing';
  io.sockets.emit('video', data);
});

video.events.on('publish', function(data){
  data.status   = 'publish';
  data.location = path.normalize(data.directory.replace(process.cwd(), ''));
  io.sockets.emit('video', data);
});

video.events.on('done', function(data){
  data.status   = 'done';
  data.location = path.normalize(data.directory.replace(process.cwd(), ''));
  io.sockets.emit('video', data);
});



// phidget button events
phidget.events.on('activate', function(type){
  // add or delete filters
  var index = filters.indexOf(type);
  if(index != -1) filters.splice(index, 1);
  else filters.push(type);

  io.sockets.emit('phidget', { status : 'activate', filters : filters });
});

phidget.events.on('capture', function(type){
  if(!isCapturing){
    io.sockets.emit('phidget', { status : 'capture' });
    inActiveMode = true;
  }
});



// routes
app.get('/', function(req, res){
  res.render('index');
});
