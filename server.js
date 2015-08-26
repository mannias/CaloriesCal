var express = require('express'),
	path = require('path'), 
	url = require('url'),
	app = exports.app = express(),
	http = require('http').createServer(app),
	mongoose = require('mongoose'),
	bodyParser = require('body-parser'),
	uuid = require('node-uuid'),
	config = require('./config'),
	Crypto = require('crypto'),
	passport = require('passport'),
  	LocalStrategy = require('passport-local').Strategy,
  	jwt = require('jwt-simple'),
  	JwtStrategy = require('passport-jwt').Strategy;

var env = process.env.NODE_ENV || 'development';
if ('development' == env) {
	mongoose.connect(config.db.dev);
}else if('production' == env){
	mongoose.connect(process.env.MONGOLAB_URI);
}else{
	mongoose.connect(config.db.test);
};
	

var tokenSecret = 'verySecret';

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

passport.use(new LocalStrategy(
  	function(username, password, done) {
    	User.findOne({ username: username }, function(err, user) {
      		if (err) { return done(err); }
      		if (!user) {
      			return done(null, false, { reason: 'Incorrect username.' });
      		}
      		if (hashPassword(password,user.salt) != user.password) {
        		return done(null, false, { reason: 'Incorrect password.' });
      		}
      		return done(null, user);
    	});
  	}
));

var opts = {}
opts.secretOrKey = 'verySecret';

passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    User.findOne({_id: jwt_payload.userId}, function(err, user) {
        if (err) {
            return done(err, false);
        }
        if (user) {
            done(null, user);
        } else {
            done(null, false);
            // or you could create a new account 
        }
    });
}));

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
app.use(passport.initialize());


app.get("/", function(req, res){
	res.sendFile(__dirname + '/index.html');
});

app.post('/api/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err) }
    if (!user) {
      return res.status(401).json({ reason: 'User not existent' });
    }
    var token = jwt.encode({ userId: user._id}, tokenSecret);
    res.status(200).json({ token : token , username: user.username});

  })(req, res, next);
});


app.post("/api/logout", passport.authenticate('jwt', { session: false }),function(req,res){
	res.sendStatus(204);
});

app.post("/api/register", function(req,res){
	var username = req.body.username;
	var password = req.body.password;
	User.findByUsername(username, function(err, users){
		if(users.length == 0){
			var salt = generateSalt();
			var hashedPassword = hashPassword(password, salt);
			var user = new User({username: username, password:hashedPassword, caloriesTarget: 0, privilege: 0, salt: salt});
			user.save();
			res.status(201).json({ username: username});
		}else{
			res.status(409).json({ reason: "User already exists" });
		}
	});
});

app.get("/api/users/:username/calories", passport.authenticate('jwt', { session: false }), function(req,res){
	var username = req.params.username;
	var description = req.body.description;
	var calories = req.body.calories;
	var logged = req.user;
	if(logged.username != username && logged.privilege < 1){
		res.status(403).json({reason: "Not enough permission to get user"});
		return;
	}
	var users = User.findByUsername(username, function(err, users){
		if(users.length > 0){
				res.status(200).json(users[0].calories);
		}else{
			res.status(404).json({reason: "User not found"});
		}
	});
});

app.post("/api/users/:username/calories", passport.authenticate('jwt', { session: false }), function(req,res){
	var username = req.params.username;
	var description = req.body.description;
	var calories = req.body.calories;
	var logged = req.user;
	if(logged.username != username && logged.privilege < 1){
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
			res.status(404).json({reason: "User not found"});
		}
	});
});

app.delete("/api/users/:username/calories/:calorieId", passport.authenticate('jwt', { session: false }), function(req, res){
	var username = req.params.username;
	var id = req.params.calorieId;
	var logged = req.user;
	if(logged.username != username && logged.privilege < 1){
		res.status(403).json({reason: "Not enough permission to modify user"});
		return;
	}
	User.update(
		{ username : username},
		{ $pull : { calories : {_id:id}}},
		function(err,status){
			if(err || status.nModified == 0){
				res.status(400).json({reason:"Could not remove object"});
			}else{
				res.sendStatus(204);
			}
		}
	);
});

app.get("/api/users/:username/calories/:calorieId", passport.authenticate('jwt', { session: false }), function(req, res){
	var username = req.params.username;
	var id = req.params.calorieId;
	var logged = req.user;
	if(logged.username != username && logged.privilege < 1){
		res.status(403).json({reason: "Not enough permission to modify user"});
		return;
	}
	User.findOne(
	{username: username, 'calories.id': id},
	{'calories.$':1},
	function(err, calorie){
		if(err){
			res.status(400).json({reason:"Could not get object"});
		}
		res.status(200).json({calorie:calorie});
	})
});

app.put("/api/users/:username/calories/:calorieId", passport.authenticate('jwt', { session: false }), function(req,res){
	var username = req.params.username;
	var id = req.params.calorieId;
	var description = req.body.description;
	var calories = req.body.calories;
	var logged = req.user;
	if(logged.username != username && logged.privilege < 1){
		res.status(403).json({reason: "Not enough permission to modify user"});
		return;
	}
	User.update(
		{username: username, 'calories._id': id },
		{$set: {'calories.$.description': description, 'calories.$.calories': calories}},
		function(err,status){
			if(err || status.nModified == 0){
				res.status(404).json({reason: "Could not find username/calorie entry"});
			}else{
				res.status(200).json({_id: id, description: description, calories: calories});
			}
		}
	)
});

function updateTarget(req,res){
	var username = req.params.username;
	var logged = req.user;
	var target = req.body.target;
	if(logged.username != username && logged.privilege < 1){
		res.status(403).json({reason: "Not enough permission to modify user"});
		return;
	}
	User.update(
		{username: username},
		{caloriesTarget: target},
		function(err,status){
			if(err || status.nModified == 0){
				res.status(400).json({reason: "Could not update"});
			}else{
				res.status(200).json({target: target});
			}
		}
	)
};

function upgradePriviledge(req,res){
	var username = req.user.username;
	var privilege = req.user.privilege;
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
				req.user.privilege += 1;
				res.sendStatus(204);
			}
		}
	)
};

function downgradePriviledge(req, res){
	var username = req.user.username;
	var privilege = req.user.privilege;

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
				req.user.privilege -=1;
				res.sendStatus(204);
			}
		}
	)
};

app.patch("/api/users/:username", passport.authenticate('jwt', { session: false }),function(req,res){
	var body = req.body;
	if(body['target']){
		updateTarget(req,res);
	}else if(body["privilege"] && body["privilege"] > 0){
		upgradePriviledge(req,res);
	}else if(body["privilege"] && body["privilege"] < 0){
		downgradePriviledge(req,res);
	}else{
		res.sendStatus(404);
	}
});

app.get("/api/users/:username", passport.authenticate('jwt', { session: false }), function(req,res){
	var logged = req.user;
	var username = req.params.username;
	if(logged.username != username && logged.privilege < 1){
		res.status(403).json({reason: "Not enough permission"});
		return;
	}
	User.findByUsername(username, function(err,users){
		if(users.length == 0){
			res.status(404).json({reason: "User does not exist"});
		}else{
			var user = users[0];
			res.status(200).json({username:username, calories: user.calories, caloriesTarget: user.caloriesTarget, privilege: user.privilege});
		}
	});

});

app.delete("/api/users/:username", passport.authenticate('jwt', { session: false }), function(req,res){
	var username = req.params.username;
	var logged = req.user;

	if(logged.username != username && logged.privilege < 2) {
		res.status(403).json({reason: "Not enough permission"});
		return;
	}
	User.remove({username: username}, function(err, status){
		if(err || status.result.n == 0){
			res.status(400).json({reason: "Could not delete"});
		}else{
			res.sendStatus(204);
		}
	});
});