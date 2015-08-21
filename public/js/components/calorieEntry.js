var React = require('react');
var UserActions = require('../actions/userActions');

var CalorieEntry = React.createClass({

	getInitialState: function() {
    	return {edit: false,
    			description: this.props.calorie.description,
    			calories: this.props.calorie.calories};
  	},

	handleEdit: function(event){
		this.setState({edit:true});
	},

	handleDelete: function(event){
		UserActions.removeCalories(this.props.username, this.props.calorie._id);
	},

	handleSubmit: function(event){
		UserActions.editCalories(this.props.username, this.props.calorie._id, this.state.description, this.state.calories);
		this.setState({edit:false});
	},

	handleDescriptionChange: function(event) {
  		this.setState({description: event.target.value});
    },
	
    handleCaloriesChange: function(event) {
	     this.setState({calories: event.target.value});
    },

	render: function(){
		var date = new Date(this.props.calorie.timestamp).toLocaleString();
		return(
			<tr>
				<td>{date}</td>
				<td>
					{this.state.edit ? 
						(<input type="text" className="form-control" placeholder="Description (ie: Food @ Wendys)" value={this.state.description} onChange={this.handleDescriptionChange} required autofocus />):
						(<p>{this.props.calorie.description}</p>)
					}
				</td>
				<td>{this.state.edit ? 
						(<input type="number" className="form-control" placeholder="#Calories" value={this.state.calories} onChange={this.handleCaloriesChange} required/>):
						(<p>{this.props.calorie.calories}</p>)
					}
				</td>
				<td>
					{this.state.edit ? 
						(<button type='button' className="btn btn-primary btn-block" onClick={this.handleSubmit}>Edit!</button>):
						(
						<div>
							<span className="glyphicon glyphicon-pencil" aria-hidden="true" onClick={this.handleEdit}></span>
  							<span className="glyphicon glyphicon-remove" aria-hidden="true" onClick={this.handleDelete}></span>
  						</div>)
  					}
				</td>
			</tr>
		)
	}
});

module.exports = CalorieEntry;