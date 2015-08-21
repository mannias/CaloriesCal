var React = require('react');
var UserActions = require('../actions/userActions');

var AddCalories = React.createClass({

	getInitialState: function() {
    	return {description: '',
    			calories: ''};
  	},

	handleSubmit: function(event){
		UserActions.addCalories(this.props.username, this.state.description, this.state.calories);
		this.setState({description: '', calories: ''});
	},

	handleDescriptionChange: function(event) {
  		this.setState({description: event.target.value});
    },
	
    handleCaloriesChange: function(event) {
	     this.setState({calories: event.target.value});
    },

	render: function() {
    	return (
    		<div className="row well">
    			<div className="col-md-4">
		    		<input type="text" className="form-control" placeholder="Description (ie: Food @ Wendys)" value={this.state.description} onChange={this.handleDescriptionChange} required autofocus />
		    	</div>
		    	<div className="col-md-4">
		    		<input type="number" className="form-control" placeholder="#Calories" value={this.state.calories} onChange={this.handleCaloriesChange} required/>
                </div>
                <div className="col-md-4">
                	<button type='button' className="btn btn-primary btn-block" onClick={this.handleSubmit}>Add!</button>
            	</div>
            </div>
		)
    }
});

module.exports = AddCalories;
