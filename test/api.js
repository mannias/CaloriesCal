var should = require('chai').should();
var expect = require('chai').expect();
var request = require('supertest');
var mongoose = require('mongoose');
var superagent = require('superagent');
var agent = superagent.agent();

process.env.NODE_ENV = 'test';

var app = require('../server').app;

for (var i in mongoose.connection.collections) {
  mongoose.connection.collections[i].remove();
}

describe('CalorieCal', function(){

  describe('account', function(){

    it('should correctly create a new account', function(done){
      var user = {
        username: "test",
        password: "test"
      }
      request(app)
      .post('/user/register')
      .send(user)
      .end(function(err, res){
        if(err){
          console.log(err);
        } 
        res.status.should.equal(200);
        done();
      });
    });

    it('should fail to create a duplicate account', function(done){
      var user = {
        username: "test",
        password: "test"
      }
      request(app)
      .post('/user/register')
      .send(user)
      .end(function(err, res){
        res.status.should.equal(500);
        done();
      });
    });
    
    it('should fail to get user data without beign loggued', function(done){
      request(app)
      .post('/me')
      .end(function(err, res){
        res.status.should.equal(404);
        done();
      });
    });

    it('should fail to get other user without beign loggued', function(done){
      request(app)
      .post('/user/test')
      .end(function(err, res){
        res.status.should.equal(404);
        done();
      });
    });

    it('should log in correctly with previously created user', function(done){
      var user = {
        username: "test",
        password: "test"
      }
      request(app)
      .post('/user/login')
      .send(user)
      .end(function(err, res){
        res.status.should.equal(200);
        done();
      });
    });

    it('should expect an error when logging in with incomplete credentials', function(done){
       var user = {
        username: "test"
      }
      request(app)
      .post('/user/login')
      .send(user)
      .end(function(err, res){
        res.status.should.equal(500);
        done();
      });
    });

    it('should should fail to add calories without beign logged', function(done){
      request(app)
      .post('/user/test/calories/add')
      .end(function(err, res){
        res.status.should.equal(401);
        done();
      });
    });

    it('should should fail to edit calories without beign logged', function(done){
      request(app)
      .post('/user/test/calories/edit')
      .end(function(err, res){
        res.status.should.equal(401);
        done();
      });
    });

    it('should should fail to delete calories without beign logged', function(done){
      request(app)
      .post('/user/test/calories/edit')
      .end(function(err, res){
        res.status.should.equal(401);
        done();
      });
    });

    it('should should fail to modify calories target without beign logged', function(done){
      request(app)
      .post('/user/test/target/edit')
      .end(function(err, res){
        res.status.should.equal(401);
        done();
      });
    });

    it('should should fail to delete an account without beign logged', function(done){
      request(app)
      .post('/user/test/delete')
      .end(function(err, res){
        res.status.should.equal(401);
        done();
      });
    });

    it('should should fail to escalate privilege without beign logged', function(done){
      request(app)
      .post('/me/privilege/escalate')
      .end(function(err, res){
        res.status.should.equal(401);
        done();
      });
    });

    it('should should fail to downgrade privilege without beign logged', function(done){
      request(app)
      .post('/me/privilege/downgrade')
      .end(function(err, res){
        res.status.should.equal(401);
        done();
      });
    });

    it('should return error if the username is not correct during log in', function(done){
      var user = {
        username: "test",
        password: "notcorrect"
      }
      request(app)
      .post('/user/login')
      .send(user)
      .end(function(err, res){
        res.status.should.equal(401);
        done();
      });
    });
  });

  describe('loggued normal user', function(){

    before(function (done) {
      var user = {
        username: "test",
        password: "test"
      }
      request(app)
      .post('/user/login')
      .send(user)
      .end(function (err, res) {
        if (err) {
          throw err;
        }
        agent.saveCookies(res);
        done();
      });
    });


    it('should return itself correctly', function(done){
      var user = {
        username: "test",
        password: "test"
      }
      var req = request(app).get('/me');
      agent.attachCookies(req);
      req.end(function(err,res){
        if(err){
          throw err;
        }
        res.body.privilege.should.equal(0);
        res.body.calories.should.have.length(0);
        res.body.caloriesTarget.should.equal(0);
        done();
      });
    });

    it('should add a new calorie entry', function(done){
      var calorie = {
        description: "test",
        calories: 100
      }
      var req = request(app).post("/user/test/calories/add");
      agent.attachCookies(req);
      req.send(calorie).end(function(err,res){
        if(err){
          throw err;
        }
        res.body.description.should.equal('test');
        res.body.calories.should.equal(100);
        done();
      });
    });

    it('should edit a calorie entry', function(done){
      var calorie = {
        description: "test",
        calories: 100
      }
      var req = request(app).post("/user/test/calories/add");
      agent.attachCookies(req);
      req.send(calorie).end(function(err,res){
        if(err){
          throw err;
        }
        var req2 = request(app).post("/user/test/calories/edit");
        agent.attachCookies(req2);
        req2.send({id: res.body._id, description:"modified", calories:50})
        .end(function(err,res){
          if(err){
            throw err;
          }
          res.body.description.should.equal('modified');
          res.body.calories.should.equal(50);
          done();
        });
      });
    });

    it('should delete a calorie entry', function(done){
      var calorie = {
        description: "test",
        calories: 100
      }
      var req = request(app).post("/user/test/calories/add");
      agent.attachCookies(req);
      req.send(calorie).end(function(err,res){
        if(err){
          throw err;
        }
        var req2 = request(app).post("/user/test/calories/remove");
        agent.attachCookies(req2);
        req2.send({id: res.body._id}).expect(200,done);
      });
    });

    it('should modify his calorie target', function(done){
       var target = {
        target:100
      }
      var req = request(app).post("/user/test/target/edit");
      agent.attachCookies(req);
      req.send(target).end(function(err,res){
        if(err){
          throw err;
        }
        res.status.should.equal(200);
        res.body.target.should.equal(target.target);
        done();
      });
    })

    it('should fail to add other user calories without privilege', function(done){
      var calorie = {
        description: "test",
        calories: 100
      }
      var req = request(app).post("/user/unexistent/calories/add");
      agent.attachCookies(req);
      req.send(calorie).expect(403,done);
    });

    it('should fail to edit other user calories without privilege', function(done){
      var calorie = {
        _id: 'asdasd123',
        description: "test",
        calories: 100
      }
      var req = request(app).post("/user/unexistent/calories/edit");
      agent.attachCookies(req);
      req.send(calorie).expect(403,done);
    });

    it('should fail to delete other user calories without privilege', function(done){
      var calorie = {
        id: 'asdasd123',
      }
      var req = request(app).post("/user/unexistent/calories/remove");
      agent.attachCookies(req);
      req.send(calorie).expect(403,done);
    });

    it('should fail to get other users', function(done){
      var req = request(app).get("/user/unexistent");
      agent.attachCookies(req);
      req.expect(403,done);
    });

    it('should fail to delete other users', function(done){
      var req = request(app).post("/user/unexistent/delete");
      agent.attachCookies(req);
      req.expect(403,done);
    });

    it('should fail to downgrade privilege since its 0', function(done){
      var req = request(app).post("/me/privilege/downgrade");
      agent.attachCookies(req);
      req.expect(500,done);
    });
  });

describe('loggued level 1 user', function(){

    before(function (done) {
      var user = {
        username: "test",
        password: "test"
      }
      request(app)
      .post('/user/login')
      .send(user)
      .end(function (err, res) {
        if (err) {
          throw err;
        }
        agent.saveCookies(res);
        
        var user = {
          username: "test2",
          password: "test2"
        }
        request(app)
        .post('/user/register')
        .send(user)
        .end(function(err, res){
          var req = request(app).post("/me/privilege/escalate");
          agent.attachCookies(req);
          req.expect(200,done);
        });
      });
    });

    it('should be able to get other users', function(done){
      var req = request(app).get("/user/test2");
      agent.attachCookies(req);
      req.end(function(err,res){
        if(err){
          throw err;
        }
        res.body.username.should.be.equal('test2');
        res.status.should.be.equal(200);
        done();
      });
    });

    it('should fail to delete other users', function(done){
      var req = request(app).post("/user/unexistent/delete");
      agent.attachCookies(req);
      req.expect(403,done);
    });

    it('should be able to add a new calorie entry to other user', function(done){
      var calorie = {
        description: "test",
        calories: 100
      }
      var req = request(app).post("/user/test2/calories/add");
      agent.attachCookies(req);
      req.send(calorie).end(function(err,res){
        if(err){
          throw err;
        }
        res.body.description.should.equal('test');
        res.body.calories.should.equal(100);
        done();
      });
    });

    it('should be able to edit a calorie entry of other user', function(done){
      var calorie = {
        description: "test",
        calories: 100
      }
      var req = request(app).post("/user/test2/calories/add");
      agent.attachCookies(req);
      req.send(calorie).end(function(err,res){
        if(err){
          throw err;
        }
        var req2 = request(app).post("/user/test2/calories/edit");
        agent.attachCookies(req2);
        req2.send({id: res.body._id, description:"modified", calories:50})
        .end(function(err,res){
          if(err){
            throw err;
          }
          res.body.description.should.equal('modified');
          res.body.calories.should.equal(50);
          done();
        });
      });
    });

    it('should be able to delete other users calorie entry', function(done){
      var calorie = {
        description: "test",
        calories: 100
      }
      var req = request(app).post("/user/test2/calories/add");
      agent.attachCookies(req);
      req.send(calorie).end(function(err,res){
        if(err){
          throw err;
        }
        var req2 = request(app).post("/user/test2/calories/remove");
        agent.attachCookies(req2);
        req2.send({id: res.body._id}).expect(200,done);
      });
    });

    it('should be able to modify other user calorie target', function(done){
       var target = {
        target:100
      }
      var req = request(app).post("/user/test2/target/edit");
      agent.attachCookies(req);
      req.send(target).end(function(err,res){
        if(err){
          throw err;
        }
        res.status.should.equal(200);
        res.body.target.should.equal(target.target);
        done();
      });
    });

    it('should fail to add a new calorie to an unexistent user', function(done){
      var calorie = {
        description: "test",
        calories: 100
      }
      var req = request(app).post("/user/unexistent/calories/add");
      agent.attachCookies(req);
      req.send(calorie).expect(500,done);
    });

    it('should fail to edit a new calorie of an unexistent user', function(done){
      var calorie = {
        description: "test",
        calories: 100
      }
      var req = request(app).post("/user/unexistent/calories/edit");
      agent.attachCookies(req);
      req.send(calorie).expect(500,done);
    });

    it('should fail to edit a new calorie with an incorrect id', function(done){
      var calorie = {
        id:'false',
        description: "test",
        calories: 100
      }
      var req = request(app).post("/user/test2/calories/edit");
      agent.attachCookies(req);
      req.send(calorie).expect(500,done);
    });

    it('should fail to delete a calorie entry with fake id', function(done){
      var calorie = {
        id:'fakeid'
      }
      var req = request(app).post("/user/test2/calories/remove");
      agent.attachCookies(req);
      req.send(calorie).expect(500,done);
    });

    it('should fail to delete a calorie entry with unexistent user', function(done){
      var calorie = {
        description: "test",
        calories: 100
      }
      var req = request(app).post("/user/test2/calories/add");
      agent.attachCookies(req);
      req.send(calorie).end(function(err,res){
        if(err){
          throw err;
        }
        var req = request(app).post("/user/unexistent/calories/remove");
        agent.attachCookies(req);
        req.send({id: res.body._id}).expect(500,done);
      });
    });

    it('should fail to update the target of an unexistent user', function(done){
      var target = {
        target:100
      }
      var req = request(app).post("/user/unexistent/target/edit");
      agent.attachCookies(req);
      req.send(target).expect(500,done);
    });
  });

  describe('loggued level 2 user', function(){
    before(function (done) {
      var user = {
        username: "test",
        password: "test"
      }
      request(app)
      .post('/user/login')
      .send(user)
      .end(function (err, res) {
        if (err) {
          throw err;
        }
        agent.saveCookies(res);
        var req = request(app).post("/me/privilege/escalate");
        agent.attachCookies(req);
        req.expect(200,done);
      });
    });

    it('should fail to escalate more', function(done){
      var req = request(app).post("/me/privilege/escalate");
      agent.attachCookies(req);
      req.expect(500,done);
    });

    it('should fail to delete inexisting users', function(done){
      var req = request(app).post("/user/unexistent/delete");
      agent.attachCookies(req);
      req.expect(500,done);
    });

    it('should be able to delete other users', function(done){
      var req = request(app).post("/user/test2/delete");
      agent.attachCookies(req);
      req.expect(200,done);
    });

    it('should be able to delete itself', function(done){
      var req = request(app).post("/user/test/delete");
      agent.attachCookies(req);
      req.expect(200,done);
    })


  });
});