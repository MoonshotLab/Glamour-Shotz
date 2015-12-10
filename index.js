var fs = require('fs');
var path = require('path');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var facebook = require('./lib/facebook');
var io = require('socket.io')(server);
var camera = require('./lib/camera');
var phidget = require('./lib/phidget');
var video = require('./lib/video');
var s3 = require('./lib/s3');
var db = require('dirty')('local.db');
var utils = require('./lib/utils');

// handle app state
var filters       = [];
var inActiveMode  = false;



// config express
app.use(express.static('public'));
app.use(express.static('tmp'));
app.set('view engine', 'jade');
server.listen(process.env.PORT || '3000');



// connect camera and listen for events
camera.setSocket(io);
camera.connect();

camera.events.on('connected', function(){
  console.log('camera connected');
  io.sockets.emit('camera', {
    status : 'ready', humanTitle : 'Camera Ready'
  });
  camera.startLiveView();
});

camera.events.on('recording', function(){
  phidget.lights(true);
  io.sockets.emit('camera', {
    status : 'recording', humanTitle : 'Camera Recording'
  });
});



camera.events.on('done-recording', function(){

  // generate an id for dir creation
  var id = new Date().getTime().toString();

  // create an output directory
  var outputDir = path.join(process.cwd(), 'tmp', id);
  fs.mkdirSync(outputDir);

  // timeout is necessary to give the camera enough time to "stop recording"
  setTimeout(function(){

    // tell the client we're done recording
    io.sockets.emit('camera', {
      status : 'done-recording', humanTitle : 'Camera Done Recording'
    });

    // toggle the lights
    phidget.lights(false);

    camera.writeLastVideoToDisk(outputDir, function(filePath){
      // restart the live view and tell the client
      camera.startLiveView();
      io.sockets.emit('camera', {
        status : 'ready', humanTitle : 'Camera Ready'
      });

      // optimize videos in background
      video.optimize(id, outputDir, filters);

      // reset the active mode and filters to allow continual use while
      // the video optimization processes in the background
      inActiveMode  = false;
      filters       = [];
    });
  }, 2500);
});



// events from interface
io.on('connection', function(socket) {
  // listen for countdown completion from the client before recording start
  socket.on('countdown-done', camera.takeVideo);
});



// publish video processing steps to the interface
video.events.on('step', function(data){
  data.status = 'processing';
  io.sockets.emit('video', data);
});


// tell client when we're done
video.events.on('done', function(data){

  // what will we be showcasing?
  var showcase;
  if(data.outputs.gif) showcase = data.outputs.gif;
  else showcase = data.outputs.final;

  // dirty db store
  db.set(data.id, showcase.fileName);

  // modify
  data.status     = 'done';
  data.location   = showcase.shortPath;
  data.humanTitle = 'Uploading to Amazon S3';

  // notify client
  io.sockets.emit('video', data);

  // remember some files
  var remembers = [
    data.outputs.final.fullPath,
    data.outputs.poster.fullPath
  ];
  if(data.outputs.gif)
    remembers.push(data.outputs.gif.fullPath);

  // store in s3
  s3.remember(remembers).then(function(remotePaths){
    io.sockets.emit('video', { humanTitle : 'Uploading to Facebook' });

    // put this on facebook
    facebook.share(remotePaths, function(){
      io.sockets.emit('video', { humanTitle : 'Posted to Facebook!' });
    });
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
  if(!inActiveMode){
    io.sockets.emit('phidget', { status : 'capture' });
    inActiveMode = true;
  }
});



// routes
app.get('/', function(req, res){
  res.render('index');
});

app.get('/showcase', function(req, res){
  res.render('showcase');
});

app.get('/videos', function(req, res){
  var vids = [];
  db.forEach(function(key, val){
    vids.push(path.join('/', key, val));
  });

  if(req.query.shuffle) utils.shuffle(vids);

  res.send(vids);
});
