var AppDispatcher = require('../dispacher/dispacher');
var UserConstants = require('../constants/userConstants');

var UserActions = {

	getMe: function(username, redirect){
		$.get("/api/users/"+username)
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
		$.post("/api/logout")
		.done(function(result){
			AppDispatcher.dispatch({
  				actionType: UserConstants.USER_LOGOUT_SUCC
  			})
  			localStorage.removeItem("username");
		})
		.fail(function(err){
			AppDispatcher.dispatch({
  				actionType: UserConstants.USER_LOGOUT_FAIL,
  				message: result
  			})
		});
	},

	getCalories: function(username){
		if(username != null){
			var dir = "/api/users/" + username + "/calories"
			$.get(dir)
			.done(function(result){
				AppDispatcher.dispatch({
					actionType: UserConstants.USER_CALORIES_GET_SUCC,
					calorie: result
				})
			})
			.fail(function(xhr, textStatus, errorThrown){
				AppDispatcher.dispatch({
					actionType: UserConstants.USER_CALORIES_GET_FAIL,
					message: xhr.responseJSON.reason
				})
			});
  		}
	},

	addCalories: function(username, description, calories){
		if(description != null && calories != null){
			var dir = "/api/users/" + username + "/calories"
			$.post(dir, {description:description, calories:calories})
  				.done(function(result){
  					AppDispatcher.dispatch({
  						actionType: UserConstants.USER_CALORIES_ADD_SUCC,
  						calorie: result
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
			var dir = "/api/users/" + username + "/calories/"+id;
			$.ajax({
				url: dir,
				type: 'DELETE',
				success: (function(result){
					AppDispatcher.dispatch({
  						actionType: UserConstants.USER_CALORIES_REM_SUCC,
  						id:id
  					})
				}),
				error: (function(xhr, textStatus, errorThrown){
  					AppDispatcher.dispatch({
  						actionType: UserConstants.USER_CALORIES_REM_FAIL,
  						message: xhr.responseJSON.reason
  					})
  				})
			});
		}
	},

	editCalories: function(username,id,description,calories){
		if(username != null && id != null && description != null && calories != null){
			var dir = "/api/users/" + username + "/calories/"+ id;
			$.ajax({
				url: dir,
				type: 'PUT',
				data: {description: description, calories: calories},
				success: (function(result){
					AppDispatcher.dispatch({
  						actionType: UserConstants.USER_CALORIES_UPD_SUCC,
  						calorie: result
  					})
				}),
				error: (function(xhr, textStatus, errorThrown){
  					AppDispatcher.dispatch({
  						actionType: UserConstants.USER_CALORIES_UPD_FAIL,
  						message: xhr.responseJSON.reason
  					})
  				})
			});
		}
	},

	deleteUsername: function(username){
		if(username != null){
			var dir = "/api/users/" + username;
			$.ajax({
				url: dir,
				type: 'DELETE',
				success: (function(result){
					AppDispatcher.dispatch({
  						actionType: UserConstants.USER_DELETE_SUCC
  					})
				}),
				error: (function(xhr, textStatus, errorThrown){
  					AppDispatcher.dispatch({
  						actionType: UserConstants.USER_DELETE_FAIL,
  						message: xhr.responseJSON.reason
  					})
  				})
			});
		}
	},

	getUser: function(username){
		if(username != null){
			var that = this;
			$.get("/api/users/" + username)
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
			})
		}
	},

	escalatePrivilege: function(username){
		var url = '/api/users/' + username
		$.ajax({
			url: url,
			data: {privilege: +1},
			type: 'PATCH',
			success:(function(result){
			AppDispatcher.dispatch({
					actionType: UserConstants.USER_ESCALATE_SUCC
				})
			}),
			error:(function(xhr, textStatus, errorThrown){
				AppDispatcher.dispatch({
					actionType: UserConstants.USER_ESCALATE_FAIL,
					message: xhr.responseJSON.reason
				})
			})
		});
	},

	downgradePrivilege: function(username){
		var url = '/api/users/' + username
		$.ajax({
			url: url,
			type: 'PATCH',
			data: {privilege: -1},
			success:(function(result){
			AppDispatcher.dispatch({
					actionType: UserConstants.USER_DOWNGRADE_SUCC
				})
			}),
			error:(function(xhr, textStatus, errorThrown){
				AppDispatcher.dispatch({
					actionType: UserConstants.USER_DOWNGRADE_FAIL,
					message: xhr.responseJSON.reason
				})
			})
		});
	},

	editCalorieTarget: function(username, target){
		if(username != null && target != null){
			var dir = "/api/users/" + username;
			$.ajax({
				url: dir,
				type: 'PATCH',
				data: {target: target},
				success:(function(result){
					AppDispatcher.dispatch({
  						actionType: UserConstants.USER_TARGETCAL_UPD_SUCC,
  						target: target
  					})
				}),
				error:(function(xhr, textStatus, errorThrown){
  					AppDispatcher.dispatch({
  						actionType: UserConstants.USER_TARGETCAL_UPD_FAIL,
  						message: xhr.responseJSON.reason
  					})
  				})
			});
		}
	},
}

module.exports = UserActions;