var React = require('react');
var CalorieEntry = require('./calorieEntry');
var ReactPropTypes = React.PropTypes;

var Calories = React.createClass({

	propTypes: {
    	allCalories: ReactPropTypes.object.isRequired,
  	},

	render: function(){
		if (Object.keys(this.props.allCalories).length < 1) {
      		return null;
    	}
    
    	var _allCalories = this.props.allCalories;
    	var calories = [];

    	for (var key in _allCalories) {
    		var id = _allCalories[key]._id;
      		calories.push(<CalorieEntry key={id} calorie={_allCalories[key]} username={this.props.username} />);
      	}
		return(
			<table className="table table-hover">
				<thead>
					<th>Date</th>
					<th>Description</th>
					<th>#Calories</th>
					<th>Actions</th>
				</thead>
				<tbody>
					{calories}
				</tbody>
			</table>
		)
	}
});

module.exports = Calories;