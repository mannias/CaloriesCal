var express = require('express'),
	path = require('path'), 
	url = require('url'),
	app = express(),
	http = require('http').createServer(app),
	mongoose = require('mongoose'),
	bodyParser = require('body-parser')


mongoose.connect('mongodb://localhost/calorieCal');	

var Schema = mongoose.Schema;

var userSchema = new Schema({
	username: String,
	password: String
})

userSchema.statics.findByUsername = function(username, cb){
	return this.model('User').find({username: username}, cb);
}

userSchema.statics.findByUsernameAndPassword = function(username, password, cb){
	return this.model('User').find({username: username, password: password}, cb);
}

var User = mongoose.model('User', userSchema);

var port = process.env.PORT || 8000;

var server = app.listen(port, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Calorie counter running at http://%s:%s', host, port);
});

app.use("/static", express.static('public'));
app.use(bodyParser.json());


app.get("/", function(req, res){
	res.sendFile(__dirname + '/index.html');
});

app.post("/user/register", function(req,res){
	var username = req.body.username;
	var password = req.body.password;
	User.findByUsername(username, function(err, users){
		if(users.length == 0){
			var user = new User({username: username, password:password});
			user.save();
			res.sendStatus(200);
		}else{
			res.status(500).json({ reason: "User already exists" });
		}
	});
});

app.get("/user/login", function(req,res){
	var username = req.body.username;
	var password = req.body.password;
	console.log(username + " " + password);
	User.findByUsernameAndPassword(username,password, function(err,users){
		console.log(users);
		if(users.length != 0){
			var user = users[0];
			res.sendStatus(200);
		}else{
			res.status(500).json({ reason: "Incorrect User/Password" });
		}
	});
});