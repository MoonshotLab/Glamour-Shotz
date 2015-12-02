socket.on('camera', function(data){
  console.log('camera', data);

  switch(data.status){
    case 'connected':
      break;
    case 'recording':
      $('body').addClass('recording');
      break;
    case 'done-recording':
      $('body').removeClass('recording');
      $('li').removeClass('highlight');
      break;
  }
});


socket.on('phidget', function(data){
  console.log('phidget', data);

  if(data.status == 'capture'){
    setTimeout(function(){
      // TODO: make some kind of countdown
      socket.emit('countdown-done');
    }, 1000);
  } else if(data.status == 'activate'){
    var selector = 'li.' + data.type;
    $(selector).toggleClass('highlight');
  }
});
