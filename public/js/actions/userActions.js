var AppDispatcher = require('../dispacher/dispacher');
var UserConstants = require('../constants/userConstants');

var UserActions = {

	getMe: function(username, redirect){
		if(username){
			var dir = "/api/users/"+username;
			$.ajax({
				url: dir,
				type: 'GET',
				headers: {
	        		"Authorization" :localStorage.getItem("token"),
	    		},
				success:function(result){
					AppDispatcher.dispatch({
		  				actionType: UserConstants.USER_ME_SUCC,
		  				user: result
		  			})
	  				redirect();
				},
				error:function(result){
					AppDispatcher.dispatch({
		  				actionType: UserConstants.USER_ME_FAIL,
		  				message: result
		  			})
				}
			});
		}
	},

	logout: function(){
		var dir = "/api/logout";
		$.ajax({
			url: dir,
			type: 'POST',
			headers: {
        		"Authorization" :localStorage.getItem("token"),
    		},
			success:function(result){
				AppDispatcher.dispatch({
	  				actionType: UserConstants.USER_LOGOUT_SUCC
	  			})
	  			localStorage.removeItem("username");
	  			localStorage.removeItem("token");
			},
			error:function(err){
				AppDispatcher.dispatch({
	  				actionType: UserConstants.USER_LOGOUT_FAIL,
	  				message: result
	  			})
			}
		});
	},

	getCalories: function(username){
		if(username != null){
			var dir = "/api/users/" + username + "/calories"
			$.ajax({
				url: dir,
				type: 'GET',
				headers: {
	        		"Authorization" :localStorage.getItem("token"),
	    		},
				success:function(result){
					AppDispatcher.dispatch({
						actionType: UserConstants.USER_CALORIES_GET_SUCC,
						calorie: result
					})
				},
				error:function(xhr, textStatus, errorThrown){
					AppDispatcher.dispatch({
						actionType: UserConstants.USER_CALORIES_GET_FAIL,
						message: xhr.responseJSON.reason
					})
				}
	  		});
		}
	},

	addCalories: function(username, description, calories){
		if(description != null && calories != null){
			var dir = "/api/users/" + username + "/calories"
			$.ajax({
				url: dir,
				type: 'POST',
				contentType: 'application/json',
				data: JSON.stringify({description:description, calories:calories}),
				headers: {
	        		"Authorization" :localStorage.getItem("token"),
	    		},
				success:function(result){
  					AppDispatcher.dispatch({
  						actionType: UserConstants.USER_CALORIES_ADD_SUCC,
  						calorie: result
  					})
	  			},
  				error: function(xhr, textStatus, errorThrown){
  					AppDispatcher.dispatch({
  						actionType: UserConstants.USER_CALORIES_ADD_FAIL,
  						message: xhr.responseJSON.reason
  					})
  				}
  	  		});
		}
	},

	removeCalories: function(username, id){
		if(username != null && id != null){
			var dir = "/api/users/" + username + "/calories/"+id;
			$.ajax({
				url: dir,
				type: 'DELETE',
				headers: {
	        		"Authorization" :localStorage.getItem("token"),
	    		},
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
				headers: {
	        		"Authorization" :localStorage.getItem("token"),
	    		},
	    		contentType: 'application/json',
				data: JSON.stringify({description: description, calories: calories}),
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
				headers: {
	        		"Authorization" :localStorage.getItem("token"),
	    		},
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
		if(username){
			dir = "/api/users/"+username;
			$.ajax({
				url: dir,
				type: 'GET',
				headers: {
	        		"Authorization" :localStorage.getItem("token"),
	    		},
				success:function(result){
					AppDispatcher.dispatch({
						actionType: UserConstants.USER_GET_SUCC,
						user: result
					})
				},
				error:function(xhr, textStatus, errorThrown){
					AppDispatcher.dispatch({
						actionType: UserConstants.USER_GET_FAIL,
						message: xhr.responseJSON.reason
					})
				}
			});
		}
	},

	escalatePrivilege: function(username){
		var dir = "/api/users/"+username;
		$.ajax({
			url: dir,
			type: 'PATCH',
			headers: {
        		"Authorization" :localStorage.getItem("token"),
    		},
    		contentType: 'application/json',
    		data: JSON.stringify({privilege: +1}),
    		success:function(result){
			AppDispatcher.dispatch({
					actionType: UserConstants.USER_ESCALATE_SUCC
				})
			},
			error:function(xhr, textStatus, errorThrown){
				AppDispatcher.dispatch({
					actionType: UserConstants.USER_ESCALATE_FAIL,
					message: xhr.responseJSON.reason
				})
			}
		});
	},

	downgradePrivilege: function(username){
		var url = '/api/users/' + username
		$.ajax({
			url: url,
			type: 'PATCH',
			headers: {
        		"Authorization" :localStorage.getItem("token"),
    		},
    		contentType: 'application/json',
			data: JSON.stringify({privilege: -1}),
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
				headers: {
	        		"Authorization" :localStorage.getItem("token"),
	    		},
	    		contentType: 'application/json',
				data: JSON.stringify({target: target}),
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