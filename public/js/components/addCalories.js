var React = require('react');
var UserActions = require('../actions/userActions');

var AddCalories = React.createClass({

	handleSubmit: function(event){
		UserActions.addCalories(this.props.username, this.state.description, this.state.calories);
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
		    		<input type="text" className="form-control" placeholder="Description (ie: Food @ Wendys)" onChange={this.handleDescriptionChange} required autofocus />
		    	</div>
		    	<div className="col-md-4">
		    		<input type="number" className="form-control" placeholder="#Calories" onChange={this.handleCaloriesChange} required/>
                </div>
                <div className="col-md-4">
                	<button type='button' className="btn btn-primary btn-block" onClick={this.handleSubmit}>Add!</button>
            	</div>
            </div>
		  )
    }
});

module.exports = AddCalories;
