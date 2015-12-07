var phidgets = require('phidgets');
var phidget = new phidgets.PhidgetInterfaceKit();
var events  = require('events');
var emitter = new events.EventEmitter();

var buttons = [
  {
    index     : 0,
    action    : 'activate',
    type      : 'gif'
  },
  {
    index     : 1,
    action    : 'activate',
    type      : 'slowmo'
  },
  {
    index     : 2,
    action    : 'activate',
    type      : 'reverse'
  },
  {
    index     : 3,
    action    : 'capture',
    type      : ''
  },
];


phidget.open();


phidget.on('input', function(board, data){
  buttons.forEach(function(button){
    if(button.index == data.index && data.value === true){
      emitter.emit(action, button.type);
    }
  });
});


exports.events = emitter;
