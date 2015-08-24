var React = require('react');
var UserStore = require('../store/userStore');
var AddCalories = require('./addCalories');
var Calories = require('./calories');
var UserActions = require('../actions/userActions');

function getCurrentUser(startDate, endDate, startTime, endTime){
	var user = UserStore.getUser();
	var isLogged = UserStore.getCurrentStatus();
	var totalCal = UserStore.getTodayCalorieSum();
	var calories = isLogged ? applyCurrentFilter(startDate,endDate,startTime,endTime):[];
	return {
		totalCal: totalCal,
		loggedIn : isLogged,
		user: user,
		calories: calories,
		target: user.caloriesTarget
	}
}

function applyCurrentFilter(startDate, endDate, startTime, endTime){
	return UserStore.applyCurrentFilter(Date.parse(startDate),Date.parse(endDate),startTime,endTime);
}

var Dashboard = React.createClass({

	contextTypes: {
    	router: React.PropTypes.func.isRequired
  	},

  	getInitialState() {
  		var user = UserStore.getUser();
		var isLogged = UserStore.getCurrentStatus();
		var totalCal = UserStore.getTodayCalorieSum();
		var target = isLogged? user.caloriesTarget:0;
		var startDate = (new Date((new Date().getTime()) + -7*24*3600000)).toISOString().substring(0, 10);
		var endDate =  (new Date()).toISOString().substring(0, 10);
		var calories = isLogged ? applyCurrentFilter(startDate,endDate,0,24):[];
    	return {
    		startTime:0,
    		endTime:24,
    		startDate: startDate,
    		endDate: endDate,
    		targetEdit: false,
    		target:target,
    		user: user,
    		calories: calories,
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
  		var state = this.state;
  		this.setState(getCurrentUser(state.startDate, state.endDate, state.startTime, state.endTime));
  	},

  	handleEdit: function(){
  		this.setState({targetEdit:true});
  	},

  	handleTargetChange: function(event) {
	     this.setState({target: event.target.value});
    },

    handleTargetSubmit: function(event){
    	UserActions.editCalorieTarget(this.state.user.username, this.state.target);
    	this.setState({targetEdit:false});
    },

    handleStartDate: function(event){
  		this.setState({startDate: event.target.value});
  		var state = this.state;
  		this.setState({calories: applyCurrentFilter(event.target.value, state.endDate, state.startTime, state.endTime)});
  	},

  	handleEndDate: function(event){
  		this.setState({endDate: event.target.value});
  		var state = this.state;
  		this.setState({calories: applyCurrentFilter(state.startDate, event.target.value, state.startTime, state.endTime)});
  	},

  	handleStartTime: function(event){
  		this.setState({startTime: event.target.value});
  		var state = this.state;
  		this.setState({calories: applyCurrentFilter(state.startDate, state.endDate, event.target.value, state.endTime)});
  	},

  	handleEndTime: function(event){
  		this.setState({endTime: event.target.value});
  		var state = this.state;
  		this.setState({calories: applyCurrentFilter(state.startDate, state.endDate, state.startTime, event.target.value)});
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
    					<div className="panel-title row">	
    						<h4 className="text-left col-md-6">
    						Username: {this.state.user.username} </h4>
    						<h4 className="text-right col-md-6">
	    						{this.state.totalCal < this.state.user.caloriesTarget ?
	    							( <span className="label label-success" onClick={this.handleEdit}>Behind daily calories limit: {this.state.user.caloriesTarget} </span>):
	    							( <span className="label label-danger" onClick={this.handleEdit}>Over daily calories limit: {this.state.user.caloriesTarget}</span>)
	    						}
	    						</h4>
	    					</div>
    							{this.state.targetEdit?
    								(<div className="row">
    									<div className="col-md-2 text-center">
    										<h4>Calorie limit:</h4> 
    									</div>
    									<div className="col-md-5">
    										<input type="Number" id="inputTarget" className="form-control input-lg" value={this.state.target} placeholder="Calories Limit" onChange={this.handleTargetChange} required />
           								</div>
    									<div className="col-md-5">
           									<button type='button' className="btn btn-lg btn-primary btn-block" onClick={this.handleTargetSubmit}>Change!</button>
      									</div>

    								</div>):(<div></div>)
    							}	
  					</div>
  					<div className="panel-body">
  						<div>
  							<div className="row">
				    			<div className="col-md-3">
					    			<div className="input-group">
					    				<span className="input-group-addon" id="basic-addon1">Start Date</span>
							    		<input type="date" className="form-control" value={this.state.startDate} onChange={this.handleStartDate}/>
						    		</div>
						    	</div>
						    	<div className="col-md-3">
						    		<div className="input-group">
					    				<span className="input-group-addon" id="basic-addon1">End Date</span>
						    			<input type="date" className="form-control" value={this.state.endDate} onChange={this.handleEndDate}/>
				                	</div>
				                </div>
				                <div className="col-md-3">
				                	<div className="input-group">
					    				<span className="input-group-addon" id="basic-addon1">Start Time</span>
						    			<input type="number" className="form-control" value={this.state.startTime} onChange={this.handleStartTime} min="0" max="24"/>
						    		</div>
						    	</div>
						    	<div className="col-md-3">
						    		<div className="input-group">
					    				<span className="input-group-addon" id="basic-addon1">End Time</span>
						    			<input type="number" className="form-control" value={this.state.endTime} onChange={this.handleEndTime} min="0" max="24"/>
				                	</div>
				                </div>
				            </div>
  						</div>

					{this.state.calories.length == 0 ?
						(<div> <p>No calories for the selected period</p>
						</div>):
						(<div>  
							<Calories allCalories = {this.state.calories} username = {this.state.user.username}/>
						</div>)}
					</div>
				</div>
			</div>
		
		)
    }
});

module.exports = Dashboard;