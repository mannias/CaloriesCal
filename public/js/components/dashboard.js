var React = require('react');
var Router = require('react-router');

var CalorieEntry = React.createClass({

	contextTypes: {
    	router: React.PropTypes.func.isRequired
  	},

	render: function() {
		var scope = this;
		console.log("loging");

		$.get("/me")
		.done(function(result){
			console.log(result);
		})
		.fail(function(err){
			console.log(err);
			console.log(this.context);
			scope.context.router.replaceWith("/login");
		});
		return(
			<div>
				<a>Title</a>
			</div>
		)
    }
});

module.exports = CalorieEntry;