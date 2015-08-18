var express = require('express'),
	path = require('path'), 
	url = require('url'),
	app = express(); 
	http = require('http').createServer(app);
	
var port = process.env.PORT || 8000;

var server = app.listen(port, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});

app.use("/static", express.static('public'));

app.get("/", function(req, res){
	res.sendFile(__dirname + '/index.html');
});