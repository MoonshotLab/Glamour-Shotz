var Q = require('q');
var SSDPClient = require('node-ssdp').Client;
var ssdpClient = new SSDPClient();
var needle = require('needle');
var events  = require('events');
var http = require('http');
var path = require('path');
var fs = require('fs');
var emitter = new events.EventEmitter();
var async = require('async');
var url;


var connect = function(){
  // search for sony cameras
  ssdpClient.search('urn:schemas-sony-com:service:ScalarWebAPI:1');
  ssdpClient.once('response', function (headers, statusCode, data){

    if(statusCode == 200){
      // fetch the device info from the camera
      needle.get(headers.LOCATION, function(err, res, body){
        var servicesPath = body.root.device['av:X_ScalarWebAPI_DeviceInfo']['av:X_ScalarWebAPI_ServiceList']['av:X_ScalarWebAPI_Service'];
        servicesPath.forEach(function(servicePath){
          if(servicePath['av:X_ScalarWebAPI_ServiceType'] == 'camera'){
            url = servicePath['av:X_ScalarWebAPI_ActionList_URL'];
          }
        });

        // turn remote control mode off then on
        async.series([
          function(next){
            make({ method : 'stopRecMode' }, next);
          },
          function(next){
            make({ method : 'startRecMode' }, next);
          },
          function(next){
            emitter.emit('connected');
          }
        ]);
      });
    }
  });
};



var make = function(opts, next){
  // set defaults
  if(!opts.service) opts.service = 'camera';
  if(!opts.params)  opts.params  = [];
  if(!opts.version) opts.version = '1.0';
  if(!opts.id)      opts.id      = 1;

  var jsonData = {
    'method'  : opts.method,
    'params'  : opts.params,
    'id'      : opts.id,
    'version' : opts.version
  };

  var earl = url + '/' + opts.service;
  needle.post(earl, jsonData, { json : true }, function(err, res, body){
    if(next) next(err, body);
  });
};



var takeVideo = function(done){
  async.series([
    function(next){
      make({
        method  : 'setCameraFunction',
        params  : ['Remote Shooting']
      }, next);
    },
    // set the shoot mode
    function(next){
      make({ method : 'startMovieRec'}, function(){
        emitter.emit('recording');
        next();
      });
    },
    function(next){
      setTimeout(function(){
        make({ method : 'stopMovieRec' }, function(){
          emitter.emit('done-recording');
          next();
        });
      }, 2000);
    }
  ], done);
};



var writeLastVideoToDisk = function(location, done){
  var remoteLocation;

  async.series([
    function(next){
      make({
        method  : 'setCameraFunction',
        params  : ['Contents Transfer']
      }, next);
    },
    function(next){
      make({
        service : 'avContent',
        method  : 'getContentList',
        version : '1.3',
        params  : [{ 'uri': 'storage:memoryCard1', 'stIdx': 0, 'cnt': 1, 'view': 'flat', 'sort': 'descending' }]
      }, function(err, res){
        remoteLocation = res.result[0][0].content.original[0].url;
        next();
      });
    },
    function(next){
      var stream = fs.createWriteStream(path.join(location, 'original.mp4'));
      http.get(remoteLocation, function(data){
        data.pipe(stream);
      });
      stream.on('finish', next);
    }
  ], done);
};


exports.events = emitter;
exports.connect = connect;
exports.writeLastVideoToDisk = writeLastVideoToDisk;
exports.takeVideo = takeVideo;
