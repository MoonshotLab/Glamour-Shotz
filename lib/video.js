var execute = require('child_process').exec;
var path = require('path');
var events  = require('events');
var emitter = new events.EventEmitter();


var optimize = function(outputDir, filters){
  // collect the desired file for output
  var desiredDirectiveName = filters[filters.length - 1];

  // if it includes a reverse, dump the frames for later use
  if(filters.indexOf('reverse') != -1){
    var index = filters.indexOf('reverse');
    filters.splice(index, 0, 'dump');
  }

  // add required filters
  filters.unshift('scale');
  filters.push('poster');

  // EXECUTE!
  var execIt = function(directiveName){
    var directive   = directives[directiveName];
    var inputFile   = i > 0 ? directives[filters[i - 1]].out : 'original.mp4';
    inputFile = path.join(outputDir, inputFile);

    var command = execute(directive.command(inputFile, outputDir));
    command.on('exit', function(){

      // update clients of progress
      emitter.emit('step', {
        name    : directiveName,
        text    : directive.humanTitle
      });

      // is it ready to give the client the one they asked for?
      if(directiveName == desiredDirectiveName){
        emitter.emit('publish', {
          file      : directives[desiredDirectiveName].out,
          type      : directiveName,
          directory : outputDir
        });
      }

      // recurse or be done with it
      i++;
      if(filters[i]) execIt(filters[i]);
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
        '-filter:v setpts=2.5*PTS',
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
      // create the frames directory
      fs.mkdirSync(path.join(outputDir, 'frames'));

      return [
        'cat $(ls -t',
        path.join(outputDir, 'frames/') + '*jpg)',
        '|',
        'ffmpeg -f image2pipe -vcodec mjpeg -r 25 -i -',
        '-vcodec libx264 -crf 20 -threads 0 -acodec flac',
        '-pix_fmt yuvj420p',
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
  'webm' : {
    humanTitle  : 'Encoding Modified as webM',
    out         : 'webm.webm' ,
    command     : function(inputFile, outputDir){
      return [
        'ffmpeg -i',
        inputFile,
        '-codec:v libvpx -b 1500k -codec:a libvorbis',
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
