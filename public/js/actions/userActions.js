var AppDispatcher = require('../dispacher/dispacher');
var UserConstants = require('../constants/userConstants');

var UserActions = {

	getMe: function(redirect){
		$.get("/me")
		.done(function(result){
			AppDispatcher.dispatch({
  				actionType: UserConstants.USER_ME_SUCC,
  				user: result
  			})
  			redirect();
		})
		.fail(function(result){
			AppDispatcher.dispatch({
  				actionType: UserConstants.USER_ME_FAIL,
  				message: result
  			})
		});
	},

	logout: function(){
		$.get("/user/logout")
		.done(function(result){
			AppDispatcher.dispatch({
  				actionType: UserConstants.USER_LOGOUT_SUCC
  			})
		})
		.fail(function(err){
			AppDispatcher.dispatch({
  				actionType: UserConstants.USER_LOGOUT_FAIL,
  				message: result
  			})
		});
	},

	addCalories: function(username, description, calories){
		if(description != null && calories != null){
			var dir = "/user/" + username + "/calories/add"
			$.post(dir, {description:description, calories:calories})
  				.done(function(result){
  					console.log(result);
  					AppDispatcher.dispatch({
  						actionType: UserConstants.USER_CALORIES_ADD_SUCC,
  						user: result
  					})
  				})
  				.fail(function(xhr, textStatus, errorThrown){
  					AppDispatcher.dispatch({
  						actionType: UserConstants.USER_CALORIES_ADD_FAIL,
  						message: xhr.responseJSON.reason
  					})
  				});
  		}
	},

	removeCalories: function(username, id){
		if(username != null && id != null){
			var dir = "/user/" + username + "/calories/remove";
			$.post(dir, {id:id})
				.done(function(result){
					AppDispatcher.dispatch({
  						actionType: UserConstants.USER_CALORIES_REM_SUCC,
  						user: result
  					})
				})
				.fail(function(xhr, textStatus, errorThrown){
  					AppDispatcher.dispatch({
  						actionType: UserConstants.USER_CALORIES_REM_FAIL,
  						message: xhr.responseJSON.reason
  					})
  				});
		}
	},

	editCalories: function(username,id,description,calories){
		if(username != null && id != null && description != null && calories != null){
			var dir = "/user/" + username + "/calories/edit";
			$.post(dir, {id:id, description: description, calories: calories})
				.done(function(result){
					AppDispatcher.dispatch({
  						actionType: UserConstants.USER_CALORIES_UPD_SUCC,
  						user: result
  					})
				})
				.fail(function(xhr, textStatus, errorThrown){
  					AppDispatcher.dispatch({
  						actionType: UserConstants.USER_CALORIES_UPD_FAIL,
  						message: xhr.responseJSON.reason
  					})
  				});
		}
	}

}



module.exports = UserActions;