var spawn = require('child_process').spawn;
var path = require('path');
var events  = require('events');
var emitter = new events.EventEmitter();


var optimize = function(outputDir, filters){
  // collect the desired file for output
  var desiredDirective = filters[filters.length - 1];

  // add required filters
  filters.unshift('quiet', 'scale');
  filters.push('poster');

  // SPAWN!
  var spawnIt = function(directiveName){
    var directive   = directives[directiveName];
    var inputFile   = i > 0 ? filters[i - 1] : 'original';
    inputFile       = path.join(outputDir, inputFile);
    var outputFile  = path.join(outputDir, directiveName);
    var args        = directive.args(inputFile, outputFile);
    var command     = spawn(directive.command, args);

    command.on('exit', function(){
      emitter.emit('step', {
        name    : directiveName,
        text    : directive.humanTitle
      });

      i++;

      if(directiveName == desiredDirective){
        emitter.emit('publish',
          { type : directiveName, directory : outputDir }
        );
      }

      if(filters[i]) spawnIt(filters[i]);
      else emitter.emit('done', { directory : outputDir });
    });
  };

  // execute the optimization steps based on the filters
  var i = 0;
  spawnIt(filters[i]);
};



var directives = {
  'quiet' : {
    humanTitle  : 'Removing Audio from Video',
    command     : 'ffmpeg',
    args        : function(input, output){
      return ['-i', input + '.mp4', '-an', output + '.mp4', '-y'];
    }
  },
  'scale' : {
    humanTitle  : 'Resizing Clip',
    command     : 'ffmpeg',
    args        : function(input, output){
      return ['-i', input + '.mp4', '-vf', 'scale=1920:1080', output + '.mp4', '-y'];
    }
  },
  'slowmo' : {
    humanTitle  : 'Making It SlowMo',
    command     : 'ffmpeg',
    args        : function(input, output){
      return ['-i', input + '.mp4', '-filter:v', 'setpts=4*PTS', output + '.mp4', '-y'];
    }
  },
  'reverse' : {
    humanTitle  : 'Making It Reverse-O',
    command     : './exec/reverseIt',
    args        : function(input, output){
      // TODO: do reverse here
      return ['-i', input + '.mp4', '-an', output + '.mp4', '-y'];
    }
  },
  'gif' : {
    humanTitle  : 'Making It a Gif',
    command     : 'ffmpeg',
    args        : function(input, output){
      return ['-i', input + '.mp4', '-vf', 'scale=540:304', '-r', 10, '-gifflags', '-transdiff', output + '.gif', '-y'];
    }
  },
  'webm' : {
    humanTitle  : 'Encoding Modified as webM',
    command     : 'ffmpeg',
    args        : function(input, output){
      return ['-i', input + '.mp4', '-codec:v', 'libvpx', '-b', '1500k', '-codec:a', 'libvorbis', output + '.webm', '-y'];
    }
  },
  'poster' : {
    humanTitle  : 'Capturing Poster',
    command     : 'ffmpeg',
    args        : function(input, output){
      return ['-i', input + '.webm', '-vframes', '1', '-ss', '00:00:03', output + '.jpg', '-y'];
    }
  }
};


exports.events = emitter;
exports.optimize = optimize;
