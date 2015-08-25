var config = {};

config.web = {};
config.db = {};

config.web.port = process.env.PORT || 8000;
config.db.dev = 'mongodb://localhost/calorieCal';
config.db.test = 'mongodb://localhost/calorieCal-test'

module.exports = config;