var AppDispatcher = require('../dispacher/dispacher');
var EventEmitter = require('events').EventEmitter;
var UserConstants = require('../constants/userConstants');
var assign = require('object-assign');

var _currentUser = {};
var _loggedUser = {};
var _isCurrentlyLoggued = false;

var CHANGE_EVENT = 'change';

function setUser(user) {
	if(_loggedUser.username == user.username){
		_loggedUser = user;
	}
	_currentUser = user;
	_isCurrentlyLoggued = true;
}

function removeLoggedUser(){
	_currentUser = {};
	_loggedUser = {};
	_isCurrentlyLoggued = false;
}

function removeUser() {
	if(_currentUser.username == _loggedUser.username){
		removeLoggedUser();
	}else{
		_currentUser = _loggedUser;
	}
}

function setLoggedUser(user){
	_currentUser = user;
	_loggedUser = user;
	_isCurrentlyLoggued = true;
}

function isToday(d1){

	var today = new Date();
  	return d1.getFullYear() == today.getFullYear() &&
        	d1.getMonth() == today.getMonth() &&
        	d1.getDate() == today.getDate();
}

function filterCondition(date, startDate, endDate, startTime, endTime){
	endDate += 24*3600000;
	startDate += date.getTimezoneOffset()*60*1000;
	endDate += date.getTimezoneOffset()*60*1000;

	return date >=startDate && date <= endDate && date.getHours() >= startTime && 
		date.getHours() <= endTime;
}

function escalatePrivilege(){
	_loggedUser.privilege +=1;
}

function downgradePrivilege(){
	_loggedUser.privilege -=1;
}

function addCalorie(object){
	_currentUser.calories.push(object);
}

function removeCalorie(id){
	for(var i = 0; i<_currentUser.calories.length; i++){
		if(_currentUser.calories[i]._id == id){
			_currentUser.calories.splice(i,1);
			return;
		}
	}
}

function updateCalorie(calorie){
	for(var i = 0; i<_currentUser.calories.length; i++){
		if(_currentUser.calories[i]._id == calorie._id){
			_currentUser.calories[i] = {_id: calorie._id, description: calorie.description, calories: calorie.calories, timestamp: _currentUser.calories[i].timestamp}
			return;
		}
	}
}

function updateTarget(target){
	_currentUser.caloriesTarget = target;
}

var UserStore =  assign({}, EventEmitter.prototype, {

	getUser: function() {
    	return _currentUser;
  	},

  	getLogguedUser: function(){
  		return _loggedUser;
  	},

  	getCurrentStatus: function(){
  		return _isCurrentlyLoggued;
  	},

  	applyCurrentFilter: function(startDate, endDate, startTime, endTime){
  		var resp = [];
  		var i = 0;
  		_currentUser.calories.forEach(function(current, index, arr){
  			var date = new Date(current.timestamp);
  			if(filterCondition(date,startDate,endDate,startTime,endTime)){
  				resp[i++] = current;
  			}
  		});
  		return resp;
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
	switch(action.actionType) {
		case(UserConstants.USER_ME_SUCC):
			setLoggedUser(action.user);
			UserStore.emitChange();
			break;
		case(UserConstants.USER_CALORIES_ADD_SUCC):
			addCalorie(action.calorie);
			UserStore.emitChange();
			break;
		case(UserConstants.USER_CALORIES_REM_SUCC):
			removeCalorie(action.id);
			UserStore.emitChange();
			break;
		case(UserConstants.USER_CALORIES_UPD_SUCC):
			updateCalorie(action.calorie);
			UserStore.emitChange();
			break;
		case(UserConstants.USER_TARGETCAL_UPD_SUCC):
			updateTarget(action.target);
			UserStore.emitChange();
			break;
		case(UserConstants.USER_GET_SUCC):
			setUser(action.user);
			UserStore.emitChange();
			break;
		case(UserConstants.USER_LOGOUT_SUCC):
			removeLoggedUser();
			UserStore.emitChange();
			break;
		case(UserConstants.USER_DELETE_SUCC):
			removeUser();
			UserStore.emitChange();
			break;
		case(UserConstants.USER_CALORIES_REM_SUCC):
			removeCalorie();
			UserStore.emitChange();
			break;
		case(UserConstants.USER_ESCALATE_SUCC):
			escalatePrivilege();
			UserStore.emitChange();
			break;
		case(UserConstants.USER_DOWNGRADE_SUCC):
			downgradePrivilege();
			UserStore.emitChange();
			break;
	}
});

module.exports = UserStore;

