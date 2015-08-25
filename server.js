var express = require('express'),
	path = require('path'), 
	url = require('url'),
	app = exports.app = express(),
	http = require('http').createServer(app),
	mongoose = require('mongoose'),
	bodyParser = require('body-parser'),
	session = require('express-session'),
	uuid = require('node-uuid'),
	config = require('./config'),
	Crypto = require('crypto');


var env = process.env.NODE_ENV || 'development';
if ('development' == env) {
	mongoose.connect(config.db.dev);
}else if('production' == env){
	mongoose.connect(process.env.MONGOLAB_URI);
}else{
	mongoose.connect(config.db.test);
};
	
var Schema = mongoose.Schema;

var caloriesSchema = new Schema({
	timestamp:Number, 
	description: String, 
	calories: Number,
	privilege:Number
});

var userSchema = new Schema({
	username: String,
	password: String,
	caloriesTarget: Number,
	privilege: Number,
	salt: String,
	calories: [caloriesSchema]
});

userSchema.statics.findByUsername = function(username, callback){
	return this.model('User').find({username: username}, callback);
}

userSchema.statics.findByUsernameAndPassword = function(username, password, callback){
	return this.model('User').find({username: username, password: password}, callback);
}

var User = mongoose.model('User', userSchema);
var CaloriesSchema = mongoose.model('CaloriesSchema', caloriesSchema);

function generateSalt() {
   	var salt = Crypto.randomBytes(126);
   	return salt.toString('base64');
};

function hashPassword(password, salt){
	var hmac =  Crypto.createHmac('sha512', salt);
	hmac.setEncoding("base64");
	hmac.write(password);
	hmac.end();
	return hmac.read();
};

var server = app.listen(config.web.port, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Calorie counter running at http://%s:%s', host, port);
});

app.use("/static", express.static('public'));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(session({
  genid: function(req) {
    return uuid.v4()
  },
  secret: 'secret key for session hash',
  cookie: {},
  resave: true,
  saveUninitialized: true
}))


app.get("/", function(req, res){
	if(typeof req.session.username == 'undefined'){
		req.session.username = null;
	}
	res.sendFile(__dirname + '/index.html');
});

app.post("/user/register", function(req,res){
	var session = req.session;
	var username = req.body.username;
	var password = req.body.password;
	User.findByUsername(username, function(err, users){
		if(users.length == 0){
			var salt = generateSalt();
			var hashedPassword = hashPassword(password, salt);
			var user = new User({username: username, password:hashedPassword, caloriesTarget: 0, privilege: 0, salt: salt});
			user.save();
			session.privilege = user.privilege;
			session.username = username;
			res.sendStatus(200);
		}else{
			res.status(500).json({ reason: "User already exists" });
		}
	});
});

app.post("/user/login", function(req,res){
	var username = req.body.username;
	var password = req.body.password;
	if(typeof username == 'undefined' || username == null || typeof password == 'undefined' || password == null){
		res.status(500).json({ reason: "Incomplete credentials" });
		return;
	}
	User.findByUsername(username, function(err, users){
		if(users.length != 0){
			var user = users[0];
			if(hashPassword(password,user.salt) == user.password){
				req.session.username = username;
				req.session.privilege = users[0].privilege;
				res.sendStatus(200);
			}else{
				res.status(401).json({ reason: "Incorrect User/Password"});
			}
			
		}else{
			res.status(401).json({ reason: "Incorrect User/Password"});
		}
	});
});

app.get("/user/logout",function(req,res){
	req.session.privilege = 0;
	req.session.username = null;
	res.sendStatus(200);
})

app.post("/user/:username/calories/add", function(req,res){
	var username = req.params.username;
	var description = req.body.description;
	var calories = req.body.calories;
	var session = req.session;
	if(!session.username){
		res.status(401).json({reason: "User not logged in"});
		return;
	}
	if(session.username != username && session.privilege < 1){
		res.status(403).json({reason: "Not enough permission to modify user"});
		return;
	}
	var date = (+new Date());
	var calorieEntry = new CaloriesSchema({description: description, calories: calories, timestamp: date});
	var users = User.findByUsername(username, function(err, users){
		if(users.length > 0){
			var user = users[0];
			user.calories.push(calorieEntry);
			user.save(function(err){
				if(err){
					console.log(err);
				}
				res.status(200).json(calorieEntry);
			});
		}else{
			res.status(500).json({reason: "User not found"});
		}
	});
});

app.post("/user/:username/calories/remove", function(req, res){
	var username = req.params.username;
	var id = req.body.id;
	var session = req.session;
	if(!session.username){
		res.status(401).json({reason: "User not logged in"});
		return;
	}
	if(session.username != username && session.privilege < 1){
		res.status(403).json({reason: "Not enough permission to modify user"});
		return;
	}
	User.update(
		{ username : username},
		{ $pull : { calories : {_id:id}}},
		function(err,status){
			if(err || status.nModified == 0){
				res.status(500).json({reason:"Could not remove object"});
			}else{
				res.sendStatus(200);
			}
		}
	);
});

app.post("/user/:username/calories/edit", function(req,res){
	var username = req.params.username;
	var id = req.body.id;
	var description = req.body.description;
	var calories = req.body.calories;
	var session = req.session;
	if(!session.username){
		res.status(401).json({reason: "User not logged in"});
		return;
	}
	if(session.username != username && session.privilege < 1){
		res.status(403).json({reason: "Not enough permission to modify user"});
		return;
	}
	User.update(
		{username: username, 'calories._id': id },
		{$set: {'calories.$.description': description, 'calories.$.calories': calories}},
		function(err,status){
			if(err || status.nModified == 0){
				res.status(500).json({reason: "Could not find username/calorie entry"});
			}else{
				res.status(200).json({_id: id, description: description, calories: calories});
			}
		}
	)
});

app.post("/user/:username/target/edit", function(req,res){
	var username = req.params.username;
	var session = req.session;
	var target = req.body.target;
	if(!session.username){
		res.status(401).json({reason: "User not logged in"});
		return;
	}
	if(session.username != username && session.privilege < 1){
		res.status(403).json({reason: "Not enough permission to modify user"});
		return;
	}
	User.update(
		{username: username},
		{caloriesTarget: target},
		function(err,status){
			if(err || status.nModified == 0){
				res.status(500).json({reason: "Could not update"});
			}else{
				res.status(200).json({target: target});
			}
		}
	)
});

app.get("/me", function(req,res){
	var session = req.session;
	var username = session.username;
	if(!username){
		res.status(401).json({reason: "User not logged in"});
		return;
	}
	User.findByUsername(username, function(err,users){
		if(users.length == 0){
			res.status(500).json({reason: "User does not exist"});
		}else{
			var user = users[0];
			res.status(200).json({username:username, caloriesTarget: user.caloriesTarget, calories: user.calories, privilege: user.privilege});
		}
	});
});

app.get("/user/:username", function(req,res){
	var session = req.session;
	var username = req.params.username;
	if(session.username == null){
		res.status(401).json({reason: "User not logged in"});
		return;
	}
	if(session.username != username && session.privilege < 1){
		res.status(403).json({reason: "Not enough permission"});
		return;
	}
	User.findByUsername(username, function(err,users){
		if(users.length == 0){
			res.status(500).json({reason: "User does not exist"});
		}else{
			var user = users[0];
			res.status(200).json({username:username, caloriesTarget: user.caloriesTarget, calories: user.calories, privilege: user.privilege});
		}
	});

});

app.post("/user/:username/delete", function(req,res){
	var username = req.params.username;
	var session = req.session;
	if(!session.username){
		res.status(401).json({reason: "User not logged in"});
		return;
	}
	if(session.username != username && session.privilege < 2) {
		res.status(403).json({reason: "Not enough permission"});
		return;
	}
	User.remove({username: username}, function(err, status){
		if(err || status.result.n == 0){
			res.status(500).json({reason: "Could not delete"});
		}else{
			res.sendStatus(200);
		}
	});
});

app.post("/me/privilege/escalate", function(req,res){
	var username = req.session.username;
	var privilege = req.session.privilege;
	if(!username){
		res.status(401).json({reason: "User not logged in"});
		return;
	}
	if(privilege == 2){
		res.status(500).json({reason: "Unable to escalate more"});
		return;
	}
	User.update(
		{username: username},
		{ $inc: {privilege:1}},
		function(err,status){
			if(err){
				res.status(401).json({reason: "User not logged in"});
			}else{
				req.session.privilege += 1;
				res.sendStatus(200);
			}
		}
	)
});

app.post("/me/privilege/downgrade", function(req,res){
	var username = req.session.username;
	var privilege = req.session.privilege;

	if(!username){
		res.status(401).json({reason: "User not logged in"});
		return;
	}

	if(privilege == 0){
		res.status(500).json({reason: "Unable to downgrade more"});
		return;
	}
	User.update(
		{username: username},
		{ $inc: {privilege:-1}},
		function(err,status){
			if(err){
				res.status(401).json({reason: "User not logged in"});
			}else{
				req.session.privilege -= 1;
				res.sendStatus(200);
			}
		}
	)
});