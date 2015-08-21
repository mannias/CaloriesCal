var AppDispatcher = require('../dispacher/dispacher');
var AuthConstants = require('../constants/authConstants');
var UserActions = require('./userActions');
var React = require('react');

var AuthActions = {

	login: function(username, password, redirect){
		var scope = this;
		if(username != null && password != null){
  			console.log(username + " " + password);
  			$.post("/user/login", {username:username, password:password})
  				.done(function(result){
  					AppDispatcher.dispatch({
  						actionType: AuthConstants.AUTH_LOGIN_SUCC,
  						message: result
  					});
  					UserActions.getMe(redirect);
  				})
  				.fail(function(xhr, textStatus, errorThrown){
  					AppDispatcher.dispatch({
  						actionType: AuthConstants.AUTH_LOGIN_FAIL,
  						message: xhr.responseJSON.reason
  					})
  				});
  		}
	},

	register: function(username, password, redirect){
		var scope = this;
		if(username != null && password != null){
  			console.log(username + " " + password);
  			$.post("/user/register", {username:username, password:password})
  				.done(function(result){
  					AppDispatcher.dispatch({
  						actionType: AuthConstants.AUTH_REG_SUCC,
  						message: result
  					});
            		UserActions.getMe(redirect);
  				})
  				.fail(function(xhr, textStatus, errorThrown){
  					AppDispatcher.dispatch({
  						actionType: AuthConstants.AUTH_REG_FAIL,
  						message: xhr.responseJSON.reason
  					})
  				});
  		}
	}


}

module.exports = AuthActions;