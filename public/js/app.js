var Router = require('react-router');
var React = require('react');
var Header = require('./components/header');
var Login = require('./components/login');
var Dashboard = require('./components/dashboard');
var UserActions = require('./actions/userActions');

var DefaultRoute = Router.DefaultRoute;
var Link = Router.Link;
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;

var CaloriesApp = React.createClass({

  contextTypes: {
      router: React.PropTypes.func.isRequired
  },

  getInitialState() {
    var scope = this;
    var userId = localStorage.getItem("username") || 0;
    if(userId != 0){
      UserActions.getMe(userId, function(){
        scope.context.router.replaceWith('/');
      });
    } 
    return null; 
  },

	render: function() {
    	return (
    		<div>
    			<Header />
          <RouteHandler/>
      	</div>
    	)
    }
});

var routes = (
	<Route handler={CaloriesApp} path="/">
		<DefaultRoute handler={Dashboard} />
    <Route name="login" path="/login" handler={Login} />
	</Route>
);

Router.run(routes, function (Handler) {
  React.render(<Handler />, document.getElementById('caloriesapp'));
});
