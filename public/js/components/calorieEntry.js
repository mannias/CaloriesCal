var React = require('react');
var UserActions = require('../actions/userActions');

var CalorieEntry = React.createClass({

	handleEdit: function(event){
		console.log("a");
	},

	handleDelete: function(event){
		UserActions.removeCalories(this.props.username, this.props.calorie._id);
	},

	render: function(){
		return(
			<tr>
				<td>{this.props.calorie.timestamp}</td>
				<td>{this.props.calorie.description}</td>
				<td>{this.props.calorie.calories}</td>
				<td>
  					<span className="glyphicon glyphicon-pencil" aria-hidden="true" onClick={this.handleEdit}></span>
  					<span className="glyphicon glyphicon-remove" aria-hidden="true" onClick={this.handleDelete}></span>
				</td>
			</tr>
		)
	}
});

module.exports = CalorieEntry;