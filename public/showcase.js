var emptyStage = function(){
  $('#vid').remove();
  $('.gif').remove();
};


var playVideo = function(source){
  var template = [
    '<video loop id="vid">',
      '<source src="',
      source,
      '">',
    '</video>'
  ].join('');

  $('body').append(template);
  $('#vid')[0].play();
};


var playGif = function(source){
  var template = [
    '<img class="gif" rel:rubbable="0" rel:auto_play="0" src="',
    source,
    '" />'
  ].join('');

  for(var i=0; i<9; i++){
    $('body').append(template);
  }
};



var playRandomMedia = function(){
  emptyStage();

  $.ajax({
    url : '/videos?shuffle=true',
    success : function(results){
      var mediaLocation = results[0];
      if(mediaLocation.indexOf('.gif') != -1) playGif(mediaLocation);
      else playVideo(mediaLocation);

      clearTimeout(moveOnTimeout);
      moveOnTimeout = setTimeout(playRandomMedia, 5000);
    }
  });
};


var moveOnTimeout;
socket.on('video', function(data){
  if(data.status == 'done'){

    clearTimeout(moveOnTimeout);
    moveOnTimeout = setTimeout(playRandomMedia, 60000);

    emptyStage();
    if(data.location.indexOf('.gif') != -1)
      playGif(data.location);
    else playVideo(data.location);
  }

  $('.status').text(data.humanTitle);
});


socket.on('camera', function(data){
  if(data.status != 'live-feed-update')
    $('.status').text(data.humanTitle);
});


$(function(){ playRandomMedia(); });
