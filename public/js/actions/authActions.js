var AppDispatcher = require('../dispacher/dispacher');
var AuthConstants = require('../constants/authConstants');
var React = require('react');

var AuthActions = {

	contextTypes: {
      router: React.PropTypes.func.isRequired
    },

	login: function(username, password){
		var scope = this;
		if(username != null && password != null){
  			console.log(username + " " + password);
  			$.post("/user/login", {username:username, password:password})
  				.done(function(result){
  					AppDispatcher.dispatch({
  						actionType: AuthConstants.AUTH_LOGIN_SUCC,
  						message: result
  					})
  					console.log(result);
            		scope.context.router.replaceWith('/');
  				})
  				.fail(function(xhr, textStatus, errorThrown){
  					AppDispatcher.dispatch({
  						actionType: AuthConstants.AUTH_LOGIN_FAIL,
  						message: xhr.responseJSON.reason
  					})
  				});
  		}
	},

	register: function(username, password){
		var scope = this;
		if(username != null && password != null){
  			console.log(username + " " + password);
  			$.post("/user/register", {username:username, password:password})
  				.done(function(result){
  					AppDispatcher.dispatch({
  						actionType: AuthConstants.AUTH_REG_SUCC,
  						message: result
  					})
            		scope.context.router.replaceWith('/');
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