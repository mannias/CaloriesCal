var React = require('react');
var NotificationStore = require('../store/notificationStore');
var Notifications = require('./notifications');


function getAlertState() {
  	return {
    	allNotifications: NotificationStore.getAll()
  	};
}

var Header = React.createClass({

	getInitialState() {
    	return {
      		loggedIn: false,
      		allNotifications: {}
    	};
  	},

  	componentDidMount: function(){
  		NotificationStore.addChangeListener(this._onChange);
  	},

  	componentWillUnmount: function(){
  		NotificationStore.removeChangeListener(this._onChange);
  	},

  	_onChange: function(){
  		console.log("alerted");
  		this.setState(getAlertState());
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
				    	<ul className="nav navbar-nav">
				    		{this.state.loggedIn ? (	
					        		<li className="active">
					        			<a href="#">Link <span className="sr-only">(current)</span></a>
					        		</li>
				        		):
				        		(<li></li>)
				        	}
				        </ul>
				      <ul className="nav navbar-nav navbar-right">
				      	{this.state.loggedIn ?
				        	(<li><a href="">Log Out</a></li>):
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