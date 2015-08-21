var AppDispatcher = require('../dispacher/dispacher');
var EventEmitter = require('events').EventEmitter;
var AuthConstants = require('../constants/authConstants');
var UserConstants = require('../constants/userConstants');
var assign = require('object-assign');

var _all = {};

var CHANGE_EVENT = 'change';

var id = 0;

function create(text) {

  	_all[id++] = {
    	message: text
  	};
}

var NotificationStore =  assign({}, EventEmitter.prototype, {

	getAll: function() {
    	return _all;
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
		
		case(AuthConstants.AUTH_LOGIN_FAIL):
		case(AuthConstants.AUTH_REG_FAIL):
		case(UserConstants.USER_CALORIES_ADD_FAIL):
			message = action.message;
			create(message);
			NotificationStore.emitChange();
			break;
		case(AuthConstants.AUTH_REG_SUCC):
		case(AuthConstants.AUTH_LOGIN_SUCC):
			message = action.message;
			create(message);
			NotificationStore.emitChange();
			break;

			
	}
});

module.exports = NotificationStore;

