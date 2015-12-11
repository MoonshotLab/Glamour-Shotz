var uiState = 'ready';


// listen to the camera
socket.on('camera', function(data){
  switch(data.status){
    case 'ready':
      changeState(data.status);
      break;
    case 'connected':
      break;
    case 'recording':
      changeState(data.status);
      break;
    case 'done-recording':
      changeState('done');
      setTimeout(function(){
        if(uiState == 'done')
          changeState('processing');
      }, 4000);
      break;
    case 'live-feed-update':
      var query = new Date().getTime();
      var path = '/live-feed.jpg?bust=' + query;
      $('.live-feed').attr('src', path);
      break;
  }
});


// listen for button presses
socket.on('phidget', function(data){
  if(data.status == 'capture'){
    $('.ui-container').addClass('hide');
    setTimeout(startCountdown, 2000);
  } else if(data.status == 'activate'){
    // toggle the options
    $('li.option').removeClass('highlight');
    data.filters.forEach(function(filter){
      var selector = 'li.option.' + filter;
      $(selector).addClass('highlight');
    });
  }
});



var startCountdown = function(){
  changeState('countdown');
  $('.ui-container').removeClass('hide');

  $('.countdown-screen.prep').show();

  // countdown
  setTimeout(function(){
    $('.countdown-screen.three').show();
  }, 1500);
  setTimeout(function(){
    $('.countdown-screen.two').show();
  }, 2500);
  setTimeout(function(){
    $('.countdown-screen.one').show();
  }, 3500);
  setTimeout(function(){
    socket.emit('countdown-done');
  }, 4500);
  // reset the countdown ui
  setTimeout(function(){
    $('.countdown-screen').hide();
  }, 10000);
};



var changeState = function(state){
  uiState = state;

  $('.state').hide();
  $('li.option').removeClass('highlight');
  var selector = '.state.' + state;
  $(selector).show();
};
