var React = require('react');
var AuthActions = require('../actions/authActions');

var Login = React.createClass({

    contextTypes: {
      router: React.PropTypes.func.isRequired
    },

  	handleLogin: function(event) {
  		var username = this.state.username;
  		var password = this.state.password;
      var scope = this;
      AuthActions.login(username, password, function(){
        scope.context.router.replaceWith('/');
      });
  		
  	},

  	handleRegister: function(event) {
  		var username = this.state.username;
  		var password = this.state.password;
      var scope = this;
      AuthActions.register(username,password, function(){
        scope.context.router.replaceWith('/');
      });
  		
  	},

  	handleUsernameChange: function(event) {
  		this.setState({username: event.target.value});
    },
	
    handlePasswordChange: function(event) {
	     this.setState({password: event.target.value});
    },

  	render: function() {
    	return (
    		<div className="col-md-6 col-md-offset-3">
	    		<form className="form-signin well">
		        <h2 className="text-center">Login/Register</h2>
            <div className="form-group">
		    		  <input type="text" id="inputUsername" className="form-control input-lg" placeholder="Username" onChange={this.handleUsernameChange} required autofocus />
            </div>
            <div className="form-group">
		    		  <input type="password" id="inputPassword" className="form-control input-lg" placeholder="Password" onChange={this.handlePasswordChange} required/>
      			</div>
            <div className="row">
              <div className="col-md-6">
                <button type='button' className="btn btn-lg btn-primary btn-block" onClick={this.handleLogin}>Sign in</button>
        			</div>
              <div className="col-md-6">
                <button type='button' className="btn btn-lg btn-primary btn-block" onClick={this.handleRegister}>Register</button>
	      	    </div>
            </div>
          </form>
      	</div>
		  )
    }
});

module.exports = Login;
