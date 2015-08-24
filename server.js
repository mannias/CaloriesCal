var express = require('express'),
	path = require('path'), 
	url = require('url'),
	app = express(),
	http = require('http').createServer(app),
	mongoose = require('mongoose'),
	bodyParser = require('body-parser'),
	session = require('express-session'),
	uuid = require('node-uuid');


mongoose.connect('mongodb://localhost/calorieCal');	

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
	calories: [caloriesSchema]
});

userSchema.statics.findByUsername = function(username, callback){
	return this.model('User').find({username: username}, callback);
}

userSchema.statics.findByUsernameAndPassword = function(username, password, callback){
	return this.model('User').find({username: username, password: password}, callback);
}

var User = mongoose.model('User', userSchema);

var port = process.env.PORT || 8000;

var server = app.listen(port, function () {
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
			var user = new User({username: username, password:password, caloriesTarget: 0, privilege: 0});
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
	User.findByUsernameAndPassword(username,password, function(err,users){
		if(users.length != 0){
			var user = users[0];
			req.session.username = username;
			req.session.privilege = users[0].privilege;
			res.sendStatus(200);
		}else{
			res.status(500).json({ reason: "Incorrect User/Password" });
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
	if(session.username != username && session.privilege < 1){
		res.status(403).json({reason: "Not enough permission to modify user"});
		return;
	}
	var date = (+new Date());
	var calorieEntry = {description: description, calories: calories, timestamp: date}; 
	var users = User.findByUsername(username, function(err, users){
		if(users.length > 0){
			var user = users[0];
			user.calories.push(calorieEntry);
			user.save(function(err){
				if(err){
					console.log(err);
				}
			});
			res.status(200).json({username: user.username, caloriesTarget: user.caloriesTarget, calories: user.calories, privilege: user.privilege});
		}
	});
});

app.post("/user/:username/calories/remove", function(req, res){
	var username = req.params.username;
	var id = req.body.id;
	var session = req.session;
	if(session.username != username && session.privilege < 1){
		res.status(403).json({reason: "Not enough permission to modify user"});
		return;
	}
	User.update(
		{ username : username},
		{ $pull : { calories : {_id:id}}},
		function(err,status){
			if(err){
				res.status(500).json({reason:"Could not remove object"});
			}else{
				User.findByUsername(username, function(err, users){
					if(users.length > 0){
						var user = users[0];
						res.status(200).json({username: user.username, caloriesTarget: user.caloriesTarget, calories: user.calories, privilege: user.privilege});
					}
				});
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
	if(session.username != username && session.privilege < 1){
		res.status(403).json({reason: "Not enough permission to modify user"});
		return;
	}
	User.update(
		{username: username, 'calories._id': id },
		{$set: {'calories.$.description': description, 'calories.$.calories': calories}},
		function(err,status){
			if(err){
				res.status(500).json({reason: "User not found"});
			}else{
				User.findByUsername(username, function(err, users){
					if(users.length > 0){
						var user = users[0];
						res.status(200).json({username: user.username, caloriesTarget: user.caloriesTarget, calories: user.calories, privilege: user.privilege});
					}
				});
			}
		}
	)
});

app.post("/user/:username/target/edit", function(req,res){
	var username = req.params.username;
	var session = req.session;
	var target = req.body.target;
	if(session.username != username && session.privilege < 1){
		res.status(403).json({reason: "Not enough permission to modify user"});
		return;
	}
	User.update(
		{username: username},
		{caloriesTarget: target},
		function(err,status){
			if(err){
				res.status(500).json({reason: "Could not update"});
			}else{
				User.findByUsername(username, function(err, users){
					if(users.length > 0){
						var user = users[0];
						res.status(200).json({username: user.username, caloriesTarget: user.caloriesTarget, calories: user.calories, privilege: user.privilege});
					}
				});
			}
		}
	)
});

app.get("/me", function(req,res){
	var session = req.session;
	var username = session.username;
	if(username == null){
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
	if(username == null && session.username != username && session.privilege < 2) {
		res.status(403).json({reason: "Not enough permission"});
		return;
	}
	User.remove({username: username}, function(err){
		if(err){
			res.status(500).json({reason: "Could not delete"});
		}else{
			res.sendStatus(200);
		}
	});
});

app.post("/me/privilege/escalate", function(req,res){
	var username = req.session.username;
	var privilege = req.session.privilege;

	if(username == null){
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

	if(username == null){
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