var AppDispatcher = require('../dispacher/dispacher');
var EventEmitter = require('events').EventEmitter;
var UserConstants = require('../constants/userConstants');
var assign = require('object-assign');

var _currentUser = {};
var _isCurrentlyLoggued = false;

var CHANGE_EVENT = 'change';

function setUser(user) {
	_currentUser = user;
	_isCurrentlyLoggued = true;
}

function removeUser() {
	_currentUser = {};
	_isCurrentlyLoggued = false
}

function isToday(d1){

	var today = new Date();
  	return d1.getUTCFullYear() == today.getUTCFullYear() &&
        	d1.getUTCMonth() == today.getUTCMonth() &&
        	d1.getUTCDate() == today.getUTCDate();
}

var UserStore =  assign({}, EventEmitter.prototype, {

	getUser: function() {
    	return _currentUser;
  	},

  	getCurrentStatus: function(){
  		return _isCurrentlyLoggued;
  	},

  	getTodayCalorieSum: function(){
  		if(!_isCurrentlyLoggued){
  			return 0;
  		}
  		var sum = 0;
  		_currentUser.calories.forEach(function(current, index, arr){
  			if(isToday(new Date(current.timestamp))){
  				sum += current.calories;
  			}
  		});
  		return sum;
  	},

	emitChange: function() {
		this.emit(CHANGE_EVENT);
	},

	addChangeListener: function(callback) {
	    this.on(CHANGE_EVENT, callback);
	},

	removeChangeListener: function(callback) {
	    this.removeListener(CHANGE_EVENT, callback);
	}

});

AppDispatcher.register(function(action) {
	var message;
	switch(action.actionType) {
		case(UserConstants.USER_CALORIES_ADD_SUCC):
		case(UserConstants.USER_ME_SUCC):
		case(UserConstants.USER_CALORIES_REM_SUCC):
		case(UserConstants.USER_CALORIES_UPD_SUCC):
			setUser(action.user);
			UserStore.emitChange();
			break;
		case(UserConstants.USER_LOGOUT_SUCC):
			removeUser();
			UserStore.emitChange();
			break;
		case(UserConstants.USER_CALORIES_REM_SUCC):
			removeCalorie();
			UserStore.emitChange();
			break;
	}
});

module.exports = UserStore;

