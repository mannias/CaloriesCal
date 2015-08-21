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
	var loggedUser = UserStore.getLogguedUser();
	return {
		loggedIn : isLogged,
		user: user,
		loggedUser: loggedUser
	}
}

var Header = React.createClass({

	contextTypes: {
      router: React.PropTypes.func.isRequired
    },

	getInitialState() {
		var isLogged = UserStore.getCurrentStatus();
		var user = UserStore.getUser();
		var loggedUser = UserStore.getLogguedUser();
    	return {
      		loggedIn: isLogged,
      		allNotifications: {},
      		user: user,
      		loggedUser: loggedUser
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

  	handleDelete: function(){
  		var scope = this;
  		UserActions.deleteUsername(this.state.user.username, function(){
  			scope.context.router.replaceWith('/');
      	});
  	},

	render: function(){
		var delAccess = this.state.loggedIn && (this.state.loggedUser.username == this.state.user.username)
		return(
			<div>
				<nav className="navbar navbar-default">
				  <div className="container-fluid">
				    <div className="navbar-header">
				      <a className="navbar-brand" href="#">CaloriesCal</a>
				    </div>
				    <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
				      <ul className="nav navbar-nav navbar-right">
			    		{delAccess?
			    			(<li><a href='#' onClick={this.handleDelete}>Delete User</a></li>):
			    			(<div></div>)
			    		}
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