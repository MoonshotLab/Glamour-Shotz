var fs = require('fs');
var path = require('path');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var camera = require('./lib/camera');
var phidget = require('./lib/phidget');

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
  var outputDir = path.join(process.cwd(), 'tmp', new Date().getTime().toString());
  fs.mkdirSync(outputDir);

  // necessary to give the camera enough time to "stop recording"
  setTimeout(function(){
    camera.writeLastVideoToDisk(outputDir, function(filePath){
      inActiveMode  = false;
      filters       = [];
      io.sockets.emit('camera', { status : 'ready' });
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
