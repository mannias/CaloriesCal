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

var UserStore =  assign({}, EventEmitter.prototype, {

	getUser: function() {
    	return _currentUser;
  	},

  	getCurrentStatus: function(){
  		return _isCurrentlyLoggued;
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
		case(UserConstants.USER_ME_SUCC):
			setUser(action.user);
			UserStore.emitChange();
			break;
		case(UserConstants.USER_LOGOUT_SUCC):
			removeUser();
			UserStore.emitChange();
			break;

	}
});

module.exports = UserStore;

