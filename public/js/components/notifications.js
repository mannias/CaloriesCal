var React = require('react');
var InfoAlert = require('./alert');
var ReactPropTypes = React.PropTypes;

var Notifications = React.createClass({

	propTypes: {
    	allNotifications: ReactPropTypes.object.isRequired,
  	},

  	render: function() {
  		if (Object.keys(this.props.allNotifications).length < 1) {
      		return null;
    	}
    
    	var allNotifications = this.props.allNotifications;
    	var notifications = [];

    	for (var key in allNotifications) {
      		notifications.push(<InfoAlert key={key} message={allNotifications[key]} />);
      	}

      	return(
      		<div>
      			{notifications}
      		</div>
      	)
    }

});

module.exports = Notifications;
