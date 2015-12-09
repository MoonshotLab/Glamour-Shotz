var emptyStage = function(){
  $('#vid').remove();
  $('.gif').remove();
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
    '<img class="gif" rel:rubbable="0" rel:auto_play="0" src="',
    source,
    '" />'
  ].join('');

  for(var i=0; i<9; i++){
    $('body').append(template);
  }

  setTimeout(playRandomMedia, 5000);
};



var playRandomMedia = function(){
  emptyStage();

  $.ajax({
    url : '/videos?shuffle=true',
    success : function(results){
      var mediaLocation = results[0];
      if(mediaLocation.indexOf('.gif') != -1) playGif(mediaLocation);
      else playVideo(mediaLocation);
    }
  });
};


socket.on('video', function(data){
  if(data.status == 'publish'){
    emptyStage();
    var mediaLocation = data.location + '/' + data.file;
    if(mediaLocation.indexOf('.gif') != -1) playGif(mediaLocation);
    else playVideo(mediaLocation);
  }

  $('.status').text(data.humanTitle);
});


socket.on('camera', function(data){
  if(data.status != 'live-feed-update')
    $('.status').text(data.humanTitle);
});


$(function(){ playRandomMedia(); });
