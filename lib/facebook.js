var config = require('../config')();
var needle = require('needle');



var share = function(files){
  var graphUrl = 'https://graph.facebook.com/v2.5/photos';
  var postData = {
    url : 'https://glamour-shotz.s3.amazonaws.com/1449016043132.gif',
    access_token : 'CAACEdEose0cBAKuyHzAEZCeagtTWZB5yZCYR44X686KFx3z7WtKB2qqiYdZAudFzhz2mn0SCKSdQmYPOs2GLkkf1ZCZA28ZAv4LEI5KDQrZCxEXzFDjMt8vI8m6aanZBTUh9IbusZCRAEwYW9X3ZArWIYFDeYH8m1ARmTkcxflOJstT1RZC5ZCUqSDinV8KRiTZCLcT36T4IXpce48AAZDZD'
  };

  needle.post(graphUrl, postData, function(err, res){
    console.log(err, res.body);
  });
};


exports.share = share;
