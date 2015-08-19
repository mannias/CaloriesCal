var LoginBox = React.createClass({
  	
  	handleLogin: function(event) {
  		var username = this.state.username;
  		var password = this.state.password;
  		if(username != null && password != null){
  			console.log(username + " " + password);
  			$.post("/user/login", {username:username, password:password})
  				.done(function(result){
  					console.log(result);
  				})
  				.fail(function(xhr, textStatus, errorThrown){
  					console.log(xhr);
				    console.log(textStatus);
				    console.log(errorThrown);
  				});
  		}
  	},

  	handleRegister: function(event) {
  		var username = this.state.username;
  		var password = this.state.password;
  		if(username != null && password != null){
  			console.log(username + " " + password);
  			$.post("/user/register", {username:username, password:password})
  				.done(function(result){
  					console.log(result);
  				})
  				.fail(function(xhr, textStatus, errorThrown){
  					console.log(xhr);
				    console.log(textStatus);
				    console.log(errorThrown);
  				});
  		}
  	},

  	handleUsernameChange: function(event) {
  		this.setState({username: event.target.value});
	},
	
	handlePasswordChange: function(event) {
	   this.setState({password: event.target.value});
	},

  	render: function() {
    	return (
    		<div>
	    		<form className="form-signin">
		        	<h2 className="form-signin-heading">Please sign in</h2>
		  			<label for="inputUsername" className="sr-only">Username</label>
		    		<input type="text" id="inputUsername" className="form-control" placeholder="Username" onChange={this.handleUsernameChange} required autofocus />
					<label for="inputPassword" className="sr-only">Password</label>
		    		<input type="password" id="inputPassword" className="form-control" placeholder="Password" onChange={this.handlePasswordChange} required/>
      				<button type='button' className="btn btn-lg btn-primary btn-block" onClick={this.handleLogin}>Sign in</button>
      				<button type='button' className="btn btn-lg btn-primary btn-block" onClick={this.handleRegister}>Register</button>
	      		</form>
      		</div>
		)}
});

React.render(
  <LoginBox />,
  document.getElementById('cont')
);

