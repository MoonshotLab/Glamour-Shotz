var emptyStage = function(){
  $('#vid').remove();
  $('#gif').remove();
  $('.jsgif').remove();
};


var playVideo = function(source){
  var template = [
    '<video id="vid">',
      '<source src="',
      source,
      '">',
    '</video>'
  ].join('');

  $('body').append(template);
  $('#vid')[0].play();
  $('#vid')[0].onended = playRandomMedia;
};


var playGif = function(source){
  var template = [
    '<img id="gif" rel:rubbable="0" rel:auto_play="0" src="',
    source,
    '" />'
  ].join('');

  $('body').append(template);
  var superGif = new SuperGif({
    gif     : document.getElementById('gif'),
    on_end  : playRandomMedia
  });

  superGif.load(function(){
    $('.jsgif').show();
    superGif.play();
  });
};


var playRandomMedia = function(){
  $.ajax({
    url : '/videos?shuffle=true',
    success : function(results){
      emptyStage();

      var mediaLocation = results[0];
      if(mediaLocation.indexOf('.gif') != -1) playGif(mediaLocation);
      else playVideo(mediaLocation);
    }
  });
};


socket.on('video', function(data){
  if(data.status == 'publish'){
    var mediaLocation = data.location + '/' + data.file;
    if(mediaLocation.indexOf('.gif') != -1) playGif(mediaLocation);
    else playVideo(mediaLocation);
  }
});
