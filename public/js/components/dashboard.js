var React = require('react');
var UserStore = require('../store/userStore');
var AddCalories = require('./addCalories');
var Calories = require('./calories');

function getCurrentUser(){
	var user = UserStore.getUser();
	var isLogged = UserStore.getCurrentStatus();
	return {
		loggedIn : isLogged,
		user: user
	}
}

var CalorieEntry = React.createClass({

	contextTypes: {
    	router: React.PropTypes.func.isRequired
  	},

  	getInitialState() {
  		var user = UserStore.getUser();
		var isLogged = UserStore.getCurrentStatus();
    	return {
    		user: user,
      		loggedIn: isLogged
    	};
  	},

  	componentDidMount: function(){
  		UserStore.addChangeListener(this._onUserChange);
  	},

  	componentWillUnmount: function(){
  		UserStore.removeChangeListener(this._onUserChange);
  	},

  	_onUserChange: function(){
  		this.setState(getCurrentUser());
  	},

	render: function() {
		if(!this.state.loggedIn){
			this.context.router.replaceWith('/login');
			return null;
		}
		return(
			<div>
				{this.state.user.username}
				{this.state.user.calories.length == 0 ?
					(<div> <a> Add calories now!</a>
						<AddCalories username={this.state.user.username}/></div>):
					(<div>
						<Calories allCalories = {this.state.user.calories} username = {this.state.user.username}/>
					</div>)}
				
			</div>
		
		)
    }
});

module.exports = CalorieEntry;