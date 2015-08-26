var should = require('chai').should();
var expect = require('chai').expect();
var request = require('supertest');
var mongoose = require('mongoose');
var superagent = require('superagent');
var agent = superagent.agent();

process.env.NODE_ENV = 'test';

var app = require('../server').app;

var token = null;

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
      .post('/api/register')
      .send(user)
      .end(function(err, res){
        if(err){
          console.log(err);
        } 
        res.status.should.equal(201);
        done();
      });
    });

    it('should fail to create a duplicate account', function(done){
      var user = {
        username: "test",
        password: "test"
      }
      request(app)
      .post('/api/register')
      .send(user)
      .end(function(err, res){
        res.status.should.equal(409);
        done();
      });
    });
    
    it('should fail to get user data without beign loggued', function(done){
      request(app)
      .get('/api/users/test')
      .end(function(err, res){
        res.status.should.equal(401);
        done();
      });
    });

    it('should log in correctly with previously created user', function(done){
      var user = {
        username: "test",
        password: "test"
      }
      request(app)
      .post('/api/login')
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
      .post('/api/login')
      .send(user)
      .end(function(err, res){
        res.status.should.equal(401);
        done();
      });
    });

    it('should should fail to add calories without beign logged', function(done){
      request(app)
      .post('/api/users/test/calories')
      .end(function(err, res){
        res.status.should.equal(401);
        done();
      });
    });

    it('should should fail to edit calories without beign logged', function(done){
      request(app)
      .post('/api/users/test/calories')
      .end(function(err, res){
        res.status.should.equal(401);
        done();
      });
    });

    it('should should fail to delete calories without beign logged', function(done){
      request(app)
      .delete('/api/users/test/calories/fakeid')
      .end(function(err, res){
        res.status.should.equal(401);
        done();
      });
    });

    it('should should fail to delete an account without beign logged', function(done){
      request(app)
      .delete('/api/users/test')
      .end(function(err, res){
        res.status.should.equal(401);
        done();
      });
    });

    it('should should fail to update user without beign logged', function(done){
      request(app)
      .patch('/api/users/test')
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
      .post('/api/login')
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
      .post('/api/login')
      .send(user)
      .end(function (err, res) {
        if (err) {
          throw err;
        }
        token = "JWT "+ res.body.token;
        done();
      });
    });


    it('should return itself correctly', function(done){
      var user = {
        username: "test",
        password: "test"
      }
      request(app)
      .get('/api/users/test')
      .set('Authorization', token)
      .end(function(err,res){
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
      request(app)
        .post("/api/users/test/calories")
        .set('Authorization', token)
        .send(calorie)
        .end(function(err,res){
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
      request(app)
      .post("/api/users/test/calories")
      .set('Authorization', token)
      .send(calorie)
      .end(function(err,res){
        if(err){
          throw err;
        }
        var loc = "/api/users/test/calories/"+res.body._id;
        request(app)
        .put(loc)
        .set('Authorization', token)
        .send({description:"modified", calories:50})
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
      request(app)
      .post("/api/users/test/calories")
      .set('Authorization', token)      
      .send(calorie)
      .end(function(err,res){
        if(err){
          throw err;
        }
        request(app)
        .delete("/api/users/test/calories/"+res.body._id)
        .set('Authorization', token)
        .expect(204,done);
      });
    });

    it('should modify his calorie target', function(done){
       var target = {
        target:100
      }
      request(app)
      .patch("/api/users/test")
      .set('Authorization', token)
      .send(target)
      .end(function(err,res){
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
      request(app)
      .post("/api/users/unexistent/calories")
      .set('Authorization', token)
      .send(calorie)
      .expect(403,done);
    });

    it('should fail to edit other user calories without privilege', function(done){
      var calorie = {
        description: "test",
        calories: 100
      }
      request(app)
      .put("/api/users/unexistent/calories/fakeid")
      .set('Authorization', token)
      .send(calorie)
      .expect(403,done);
    });

    it('should fail to delete other user calories without privilege', function(done){
      request(app)
      .delete("/api/users/unexistent/calories/fakeid")
      .set('Authorization', token)
      .expect(403,done);
    });

    it('should fail to get other users', function(done){
      request(app)
      .get("/api/users/unexistent")
      .set('Authorization', token)
      .expect(403,done);
    });

    it('should fail to delete other users', function(done){
      request(app)
      .delete("/api/users/unexistent")
      .set('Authorization', token)
      .expect(403,done);
    });

    it('should fail to downgrade privilege since its 0', function(done){
      request(app)
      .patch("/api/users/test")
      .set('Authorization', token)
      .send({privilege:-1})    
      .expect(500,done);
    });
  });

describe('loggued level 1 user', function(){

    before(function (done) {
      var user = {
        username: "test2",
        password: "test2"
      }
      request(app)
      .post('/api/register')
      .send(user)
      .end(function(err, res){
        request(app)
        .patch("/api/users/test")
        .set('Authorization', token)
        .send({privilege:+1})
        .expect(204,done);
      });
    });

    it('should be able to get other users', function(done){
      request(app)
      .get("/api/users/test2")
      .set('Authorization', token)
      .end(function(err,res){
        if(err){
          throw err;
        }
        res.body.username.should.be.equal('test2');
        res.status.should.be.equal(200);
        done();
      });
    });

    it('should fail to delete other users', function(done){
      request(app)
      .delete("/api/users/unexistent")
      .set('Authorization', token)
      .expect(403,done);
    });

    it('should be able to add a new calorie entry to other user', function(done){
      var calorie = {
        description: "test",
        calories: 100
      }
      request(app)
      .post("/api/users/test2/calories")
      .set('Authorization', token)
      .send(calorie)
      .end(function(err,res){
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
      request(app)
      .post("/api/users/test2/calories")
      .set('Authorization', token)
      .send(calorie)
      .end(function(err,res){
        if(err){
          throw err;
        }
        request(app)
        .put("/api/users/test2/calories/"+res.body._id)
        .set('Authorization', token)
        .send({description:"modified", calories:50})
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
      request(app)
      .post("/api/users/test2/calories")
      .set('Authorization', token)
      .send(calorie)
      .end(function(err,res){
        if(err){
          throw err;
        }
        request(app)
        .delete("/api/users/test2/calories/"+res.body._id)
        .set('Authorization', token)
        .expect(204,done);
      });
    });

    it('should be able to modify other user calorie target', function(done){
       var target = {
        target:100
      }
      request(app)
      .patch("/api/users/test2")
      .set('Authorization', token)
      .send(target)
      .end(function(err,res){
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
      request(app)
      .post("/api/users/unexistent/calories")
      .set('Authorization', token)
      .send(calorie)
      .expect(404,done);
    });

    it('should fail to edit a new calorie of an unexistent user', function(done){
      var calorie = {
        description: "test",
        calories: 100
      }
      request(app)
      .put("/api/users/unexistent/calories/fakeid")
      .set('Authorization', token)
      .send(calorie)
      .expect(404,done);
    });

    it('should fail to edit a new calorie with an incorrect id', function(done){
      var calorie = {
        description: "test",
        calories: 100
      }
      request(app)
      .put("/api/users/test2/calories/fakeid")
      .set('Authorization', token)
      .send(calorie)
      .expect(404,done);
    });

    it('should fail to delete a calorie entry with fake id', function(done){
      request(app)
      .delete("/api/users/test2/calories/fakeid")
      .set('Authorization', token)
      .expect(400,done);
    });

    it('should fail to delete a calorie entry with unexistent user', function(done){
      var calorie = {
        description: "test",
        calories: 100
      }
      request(app)
      .post("/api/users/test2/calories")
      .set('Authorization', token)
      .send(calorie)
      .end(function(err,res){
        if(err){
          throw err;
        }
        request(app)
        .delete("/api/users/unexistent/calories/"+res.body._id)
        .set('Authorization', token)
        .expect(400,done);
      });
    });

    it('should fail to update the target of an unexistent user', function(done){
      var target = {
        target:100
      }
      request(app)
      .patch("/api/users/unexistent")
      .set('Authorization', token)
      .send(target)
      .expect(400,done);
    });
  });

  describe('loggued level 2 user', function(){

    before(function (done) {
      request(app)
      .patch("/api/users/test")
      .set('Authorization', token)
      .send({privilege:+1})
      .expect(204,done);
    });

    it('should fail to escalate more', function(done){
      request(app)
      .patch("/api/users/test")
      .set('Authorization', token)
      .send({privilege:+1})
      .expect(500,done);
    });

    it('should fail to delete inexisting users', function(done){
      var req = request(app)
      .delete("/api/users/unexistent")
      .set('Authorization', token)
      .expect(400,done);
    });

    it('should be able to delete other users', function(done){
      var req = request(app)
      .delete("/api/users/test2")
      .set('Authorization', token)
      .expect(204,done);
    });

    it('should be able to delete itself', function(done){
      var req = request(app)
      .delete("/api/users/test")
      .set('Authorization', token)
      .expect(204,done);
    })


  });
});