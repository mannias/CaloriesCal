var React = require('react');
var NotificationStore = require('../store/notificationStore');
var UserStore = require('../store/userStore');
var Notifications = require('./notifications');
var UserActions = require('../actions/userActions');
var AddCalories = require('./addCalories');


function getAlertState() {
  	return {
    	allNotifications: NotificationStore.getAll()
  	};
}

function getCurrentUser(){
	var user = UserStore.getUser();
	var isLogged = UserStore.getCurrentStatus();
	return {
		loggedIn : isLogged,
		user: user
	}
}

var Header = React.createClass({

	getInitialState() {
		var isLogged = UserStore.getCurrentStatus();
		var user = UserStore.getUser();
    	return {
      		loggedIn: isLogged,
      		allNotifications: {},
      		user: user
    	};
  	},

  	componentDidMount: function(){
  		NotificationStore.addChangeListener(this._onNotificationChange);
  		UserStore.addChangeListener(this._onUserChange);

  	},

  	componentWillUnmount: function(){
  		NotificationStore.removeChangeListener(this._onNotificationChange);
  		UserStore.removeChangeListener(this._onUserChange);
  	},

  	_onUserChange: function(){
  		this.setState(getCurrentUser());
  	},

  	_onNotificationChange: function(){
  		this.setState(getAlertState());
  	},

  	handleLogout: function(){
  		UserActions.logout();
  	},

	render: function(){
		return(
			<div>
				<nav className="navbar navbar-default">
				  <div className="container-fluid">
				    <div className="navbar-header">
				      <a className="navbar-brand" href="#">CaloriesCal</a>
				    </div>
				    <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
				      <ul className="nav navbar-nav navbar-right">
				      	{this.state.loggedIn ?
				        	(<li><a href='#' onClick={this.handleLogout}>Log Out</a></li>):
				        	(<li><a href="#/login">Log In</a></li>)}
				      </ul>
				    </div>
				  </div>
				</nav>
				<Notifications allNotifications={this.state.allNotifications} />
			</div>
		)
	}
});

module.exports = Header;