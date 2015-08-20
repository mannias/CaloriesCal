var AppDispatcher = require('../dispacher/dispacher');
var EventEmitter = require('events').EventEmitter;
var AuthConstants = require('../constants/authConstants');
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
		console.log("emit");
		this.emit(CHANGE_EVENT);
	},

	addChangeListener: function(callback) {
		console.log("subscribed");
	    this.on(CHANGE_EVENT, callback);
	},

	removeChangeListener: function(callback) {
	    this.removeListener(CHANGE_EVENT, callback);
	}

});

AppDispatcher.register(function(action) {
	var message;
	switch(action.actionType) {
		case(AuthConstants.AUTH_LOGIN_SUCC):
		case(AuthConstants.AUTH_LOGIN_FAIL):
			message = action.message;
			create(message);
			NotificationStore.emitChange();
			break;
		case(AuthConstants.AUTH_REG_SUCC):
		case(AuthConstants.AUTH_REG_FAIL):
			console.log(action);
			message = action.message;
			create(message);
			NotificationStore.emitChange();
			break;

			
	}
});

module.exports = NotificationStore;

