var execute = require('child_process').exec;
var path = require('path');
var events  = require('events');
var fs = require('fs');
var emitter = new events.EventEmitter();


var optimize = function(id, outputDir, filters){
  var outputs = {};

  // if it includes a reverse, dump the frames for later use
  // reverse has to occur before slowmo cause it chages the
  // frame rate
  var reverseIndex = filters.indexOf('reverse');
  if(reverseIndex != -1){
    filters.splice(reverseIndex, 1);
    filters.unshift('reverse');
    filters.unshift('dump');
  }

  // add required filters
  filters.unshift('scale');

  // gif must be last because it determines the file output
  var gifIndex = filters.indexOf('gif');
  if(gifIndex != -1){
    filters.splice(gifIndex, 1);
    filters.push('gif');
  }

  // finalize it
  filters.push('final');

  // add a poster at the end for good measure
  filters.push('poster');

  // EXECUTE!
  var execIt = function(directiveName){
    var directive   = directives[directiveName];
    var inputFile   = i > 0 ? directives[filters[i - 1]].out : 'original.mp4';
    inputFile = path.join(outputDir, inputFile);

    var command = execute(directive.command(inputFile, outputDir));
    command.on('exit', function(){

      // add the file name and extension to the outputs
      outputs[directiveName] = {
        fullPath  : path.join(outputDir, directive.out),
        shortPath : path.join(id, directive.out),
        fileName  : directive.out
      };

      // update clients of progress
      emitter.emit('step', {
        name        : directiveName,
        humanTitle  : directive.humanTitle,
        id          : id
      });

      // recurse or be done with it
      i++;
      if(filters[i]) execIt(filters[i]);
      else{
        emitter.emit('done', {
          outputs   : outputs,
          id        : id
        });
      }
    });
  };

  // execute the optimization steps based on the filters
  var i = 0;
  execIt(filters[i]);
};



var directives = {
  'scale' : {
    humanTitle  : 'Removing Audio from Video and Scaling',
    out         : 'scale.mp4',
    command     : function(inputFile, outputDir){
      return [
        'ffmpeg -i',
        inputFile,
        '-an -vf scale=1920:1080',
        path.join(outputDir, this.out),
        '-y'
      ].join(' ');
    }
  },
  'slowmo' : {
    humanTitle  : 'Making It SlowMo',
    out         : 'slowmo.mp4' ,
    command     : function(inputFile, outputDir){
      return [
        'ffmpeg -i',
        inputFile,
        '-filter:v setpts=2.25*PTS',
        '-ss 00:00:00.0',
        '-t 00:00:05.0',
        path.join(outputDir, this.out),
        '-y'
      ].join(' ');
    }
  },
  'dump' : {
    humanTitle  : 'Dumping Frames',
    out         : 'frames/%04d.jpg' ,
    command     : function(inputFile, outputDir){
      // create the frames directory
      var dir = path.join(outputDir, 'frames');
      if(!fs.existsSync(dir)) fs.mkdirSync(dir);

      return [
        'ffmpeg -i',
        inputFile,
        '-qscale 1',
        '-pix_fmt yuvj420p',
        path.join(outputDir, this.out),
        '-y'
      ].join(' ');
    }
  },
  'reverse' : {
    humanTitle  : 'Making It Reverse-O',
    out         : 'reverse.mp4' ,
    command     : function(inputFile, outputDir){
      return [
        'cat $(ls -r',
        path.join(outputDir, 'frames/') + '*jpg)',
        '|',
        'ffmpeg -r 60 -i -',
        '-r 120',
        path.join(outputDir, this.out),
        '-y'
      ].join(' ');
    }
  },
  'gif' : {
    humanTitle  : 'Making It a Gif',
    out         : 'gif.gif' ,
    command     : function(inputFile, outputDir){
      return [
        'ffmpeg -i',
        inputFile,
        '-vf scale=540:304 -r 5 -gifflags -transdiff',
        path.join(outputDir, this.out),
        '-y'
      ].join(' ');
    }
  },
  'final' : {
    humanTitle  : 'Finalizing, adding watermark',
    out         : 'final.mp4',
    command     : function(inputFile, outputDir){
      return [
        'ffmpeg -i',
        inputFile,
        '-pix_fmt yuv420p',
        path.join(outputDir, this.out),
        '-y'
      ].join(' ');
    }
  },
  'poster' : {
    humanTitle  : 'Capturing Poster',
    out         : 'poster.jpg',
    command     : function(inputFile, outputDir){
      return [
        'ffmpeg -i',
        inputFile,
        '-vframes 1 -ss 00:00:03',
        '-pix_fmt yuvj420p',
        path.join(outputDir, this.out),
        '-y'
      ].join(' ');
    }
  }
};


exports.events = emitter;
exports.optimize = optimize;
