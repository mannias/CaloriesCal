var Router = require('react-router');
var React = require('react');
var Header = require('./components/header');
var Login = require('./components/login');
var Dashboard = require('./components/dashboard');

var DefaultRoute = Router.DefaultRoute;
var Link = Router.Link;
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;

var CaloriesApp = React.createClass({
	render: function() {
    console.log("rendering");
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
