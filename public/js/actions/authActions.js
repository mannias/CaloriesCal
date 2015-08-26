var AppDispatcher = require('../dispacher/dispacher');
var AuthConstants = require('../constants/authConstants');
var UserActions = require('./userActions');
var React = require('react');

var AuthActions = {

	login: function(username, password, redirect){
		var scope = this;
		if(username != null && password != null){
      $.ajax({
        url: '/api/login',
        contentType: 'application/json',
        data: JSON.stringify({username: username, password:password}),
        type: 'POST',
        success: function(result){
  				AppDispatcher.dispatch({
  					actionType: AuthConstants.AUTH_LOGIN_SUCC,
  					message: result
  				});
          localStorage.setItem("token", "JWT " + result.token);
          localStorage.setItem("username", result.username);
  				UserActions.getMe(result.username, redirect);
  			},
    		error:function(xhr, textStatus, errorThrown){
  				AppDispatcher.dispatch({
  					actionType: AuthConstants.AUTH_LOGIN_FAIL,
  					message: xhr.responseJSON.reason
  				})
  			}
  		});
    }
	},

	register: function(username, password, redirect){
		var scope = this;
		if(username != null && password != null){
  			$.post("/api/register", {username:username, password:password})
  				.done(function(result){
  					AppDispatcher.dispatch({
  						actionType: AuthConstants.AUTH_REG_SUCC,
  						message: result
  					});
              scope.login(username,password,redirect);
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