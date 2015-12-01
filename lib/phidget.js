var phidgets = require('phidgets');
var phidget = new phidgets.PhidgetInterfaceKit();
var events  = require('events');
var emitter = new events.EventEmitter();
var phidgetConnected = false;

var buttons = [
  {
    location  : 0,
    action    : 'capture',
    type      : 'gif'
  },
  {
    location  : 1,
    action    : 'capture',
    type      : 'slowmo'
  },
  {
    location  : 2,
    action    : 'capture',
    type      : 'fastmo'
  },
  {
    location  : 3,
    action    : 'capture',
    type      : 'reverse'
  },
  {
    location  : 4,
    action    : 'upload',
    type      : ''
  },
];



phidget.open(function(){
  console.log('phidget online...');
  phidgetConnected = true;
});



phidget.on('error', function(error){
  console.log('phidget error:' + error);
});



phidget.on('input', function(boardId, inputId, state){
  if(phidgetConnect === true && state == 1){
    buttons.forEach(function(button){
      if(button.location == inputId)
        emitter.emit(button.action, button.type);
    });
  }
});


exports.events = emitter;
