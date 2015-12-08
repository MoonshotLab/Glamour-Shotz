// listen to the camera
socket.on('camera', function(data){
  switch(data.status){
    case 'connected':
      break;
    case 'recording':
      changeState(data.status);
      break;
    case 'done-recording':
      changeState('processing');
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
    changeState('countdown');

    // countdown
    setTimeout(function(){ $('.countdown h1').text('2');  }, 1000);
    setTimeout(function(){ $('.countdown h1').text('1');  }, 2000);
    setTimeout(function(){ socket.emit('countdown-done'); }, 3000);
    // reset the countdown ui
    setTimeout(function(){ $('.countdown h1').text('3');  }, 4000);

  } else if(data.status == 'activate'){
    // toggle the options
    $('li.option').removeClass('highlight');
    data.filters.forEach(function(filter){
      var selector = 'li.option.' + filter;
      $(selector).addClass('highlight');
    });
  }
});



var changeState = function(state){
  $('.state').hide();
  var selector = '.state.' + state;
};
