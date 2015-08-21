var React = require('react');
var UserStore = require('../store/userStore');
var AddCalories = require('./addCalories');
var Calories = require('./calories');

function getCurrentUser(){
	var user = UserStore.getUser();
	var isLogged = UserStore.getCurrentStatus();
	var totalCal = UserStore.getTodayCalorieSum();
	return {
		totalCal: totalCal,
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
		var totalCal = UserStore.getTodayCalorieSum();
    	return {
    		user: user,
    		totalCal: totalCal,
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
				<AddCalories username={this.state.user.username} />
				<div className="panel panel-default">
  					<div className="panel-heading">
    					<h3 className="panel-title">{this.state.user.username}</h3>
  					</div>
  					<div className="panel-body">
					{this.state.user.calories.length == 0 ?
						(<div> <p>You have no calories uploaded, Add them now!</p>
						</div>):
						(<div>  
							<Calories allCalories = {this.state.user.calories} username = {this.state.user.username}/>
						</div>)}
					</div>
				</div>
			</div>
		
		)
    }
});

module.exports = CalorieEntry;