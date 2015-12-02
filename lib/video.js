var spawn = require('child_process').spawn;
var path = require('path');
var events  = require('events');
var emitter = new events.EventEmitter();


var optimize = function(outputDir, filters){
  // collect the desired file for output
  var desiredDirectiveName = filters[filters.length - 1];

  // add required filters
  filters.unshift('scale');
  filters.push('poster');

  // SPAWN!
  var spawnIt = function(directiveName){
    var directive   = directives[directiveName];
    var inputFile   = i > 0 ? directives[filters[i - 1]].out : 'original.mp4';
    inputFile       = path.join(outputDir, inputFile);
    var args        = directive.args(inputFile, outputDir);
    var command     = spawn(directive.command, args);

    command.on('exit', function(){
      emitter.emit('step', {
        name    : directiveName,
        text    : directive.humanTitle
      });

      // update clients of progress
      if(directiveName == desiredDirectiveName){
        emitter.emit('publish', {
          file      : directives[desiredDirectiveName].out,
          type      : directiveName,
          directory : outputDir
        });
      }

      // recurse or be done with it
      i++;
      if(filters[i]) spawnIt(filters[i]);
      else{
        emitter.emit('done', {
          file      : directives[desiredDirectiveName].out,
          directory : outputDir
        });
      }
    });
  };

  // execute the optimization steps based on the filters
  var i = 0;
  spawnIt(filters[i]);
};



var directives = {
  'scale' : {
    humanTitle  : 'Removing Audio from Video and Scaling',
    command     : 'ffmpeg',
    out         : 'scale.mp4',
    args        : function(inputFile, outputDir){
      return ['-i', inputFile, '-an', '-vf', 'scale=1920:1080', path.join(outputDir, this.out), '-y'];
    }
  },
  'slowmo' : {
    humanTitle  : 'Making It SlowMo',
    command     : 'ffmpeg',
    out         : 'slowmo.mp4' ,
    args        : function(inputFile, outputDir){
      return ['-i', inputFile, '-filter:v', 'setpts=4*PTS', path.join(outputDir, this.out), '-y'];
    }
  },
  'reverse' : {
    humanTitle  : 'Making It Reverse-O',
    command     : './exec/reverseIt',
    out         : 'reverse.mp4' ,
    args        : function(inputFile, outputDir){
      // TODO: do reverse here
      return ['-i', inputFile, '-an', path.join(outputDir, this.out), '-y'];
    }
  },
  'gif' : {
    humanTitle  : 'Making It a Gif',
    command     : 'ffmpeg',
    out         : 'gif.gif' ,
    args        : function(inputFile, outputDir){
      return ['-i', inputFile, '-vf', 'scale=540:304', '-r', 10, '-gifflags', '-transdiff', path.join(outputDir, this.out), '-y'];
    }
  },
  'webm' : {
    humanTitle  : 'Encoding Modified as webM',
    command     : 'ffmpeg',
    out         : 'webm.webm' ,
    args        : function(inputFile, outputDir){
      return ['-i', inputFile, '-codec:v', 'libvpx', '-b', '1500k', '-codec:a', 'libvorbis', path.join(outputDir, this.out), '-y'];
    }
  },
  'poster' : {
    humanTitle  : 'Capturing Poster',
    command     : 'ffmpeg',
    out         : 'poster.jpg' ,
    args        : function(inputFile, outputDir){
      return ['-i', inputFile, '-vframes', '1', '-ss', '00:00:03', path.join(outputDir, this.out), '-y'];
    }
  }
};


exports.events = emitter;
exports.optimize = optimize;
