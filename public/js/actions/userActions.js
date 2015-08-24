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
	},

	deleteUsername: function(username){
		console.log(username);
		if(username != null){
			var dir = "/user/" + username + "/delete";
			console.log("call");
			$.post(dir, {username: username})
			.done(function(result){
					AppDispatcher.dispatch({
  						actionType: UserConstants.USER_DELETE_SUCC,
  						user: result
  					})
				})
				.fail(function(xhr, textStatus, errorThrown){
  					AppDispatcher.dispatch({
  						actionType: UserConstants.USER_DELETE_FAIL,
  						message: xhr.responseJSON.reason
  					})
  				});
		}
	},

	editCalorieTarget: function(username, target){
		if(username != null && target != null){
			var dir = "/user/" + username + "/target/edit";
			$.post(dir,{target:target})
			.done(function(result){
					AppDispatcher.dispatch({
  						actionType: UserConstants.USER_TARGETCAL_UPD_SUCC,
  						user: result
  					})
				})
				.fail(function(xhr, textStatus, errorThrown){
  					AppDispatcher.dispatch({
  						actionType: UserConstants.USER_TARGETCAL_UPD_FAIL,
  						message: xhr.responseJSON.reason
  					})
  				});
		}
	},

	getUser: function(username){
		if(username != null){
			$.get("/user/" + username)
			.done(function(result){
					AppDispatcher.dispatch({
  						actionType: UserConstants.USER_GET_SUCC,
  						user: result
  					})
				})
				.fail(function(xhr, textStatus, errorThrown){
  					AppDispatcher.dispatch({
  						actionType: UserConstants.USER_GET_FAIL,
  						message: xhr.responseJSON.reason
  					})
  				});
		}
	},

	escalatePrivilege: function(){
		$.post("/me/privilege/escalate")
			.done(function(result){
			AppDispatcher.dispatch({
					actionType: UserConstants.USER_ESCALATE_SUCC,
					user: result
				})
			})
			.fail(function(xhr, textStatus, errorThrown){
				AppDispatcher.dispatch({
					actionType: UserConstants.USER_ESCALATE_FAIL,
					message: xhr.responseJSON.reason
				})
			});
	},

	downgradePrivilege: function(){
		$.post("/me/privilege/downgrade")
			.done(function(result){
			AppDispatcher.dispatch({
					actionType: UserConstants.USER_DOWNGRADE_SUCC,
					user: result
				})
			})
			.fail(function(xhr, textStatus, errorThrown){
				AppDispatcher.dispatch({
					actionType: UserConstants.USER_DOWNGRADE_FAIL,
					message: xhr.responseJSON.reason
				})
			});
	}
}

module.exports = UserActions;