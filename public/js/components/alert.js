var React = require('react');

var InfoAlert = React.createClass({

	getInitialState() {
    	return {
      	message: ""
    	};
  	},

	render: function() {

		return(
			<div className="alert alert-info alert-dismissible" role="alert">
	  			<button type="button" className="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
	  			{this.props.message}
			</div>
		)
	}
});

module.exports = InfoAlert;