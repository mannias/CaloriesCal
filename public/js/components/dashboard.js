var React = require('react');
var UserStore = require('../store/userStore');
var AddCalories = require('./addCalories');
var Calories = require('./calories');
var UserActions = require('../actions/userActions');

function getCurrentUser(){
	var user = UserStore.getUser();
	var isLogged = UserStore.getCurrentStatus();
	var totalCal = UserStore.getTodayCalorieSum();
	return {
		totalCal: totalCal,
		loggedIn : isLogged,
		user: user,
		target: user.caloriesTarget
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
    		targetEdit: false,
    		target:0,
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

  	handleEdit: function(){
  		this.setState({targetEdit:true});
  	},

  	handleTargetChange: function(event) {
	     this.setState({target: event.target.value});
    },

    handleTargetSubmit: function(event){
    	UserActions.editCalorieTarget(this.state.user.username, this.state.target);
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
    						<h3 className="panel-title">
    						Username: {this.state.user.username} Target:
	    						{this.state.totalCal > this.state.user.caloriesTarget ?
	    							(<span className="label label-success" onClick={this.handleEdit}>{this.state.user.caloriesTarget} </span>):
	    							(<span className="label label-danger" onClick={this.handleEdit}>{this.state.user.caloriesTarget}</span>)
	    						}
    							{this.state.targetEdit?
    								(<div>
    									<p>Edit Target:</p> 
    									<input type="Number" id="inputTarget" className="form-control input-lg" value={this.state.target} placeholder="Calories Target" onChange={this.handleTargetChange} required />
           								<button type='button' className="btn btn-lg btn-primary btn-block" onClick={this.handleTargetSubmit}>Submit!</button>
      

    								</div>):(<div></div>)

    							}	
    						</h3>
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