/* jslint node: true */
var AWS = require('aws-sdk');
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var jade = require('jade');

var secret = require('./secret.js');
var config = require('./config.js');
var models = require('./lib/models.js');

AWS.config.loadFromPath('./aws-config.json');
var db = new AWS.DynamoDB();

var app = express();
app.use(express.static('public'));
app.use(cookieParser());
app.use(bodyParser());
app.use(session({ secret: secret.session.secret }));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

/*jslint unparam: true*/
passport.use(new FacebookStrategy({
  clientID: secret.facebook.clientID,
  clientSecret: secret.facebook.clientSecret,
  callbackURL: config.server.url + 'auth/facebook/callback'
},
  function (accessToken, refreshToken, profile, done) {
    models.User.getOrCreateFromFbProfile(profile, db, done);
  }));
/*jslint unparam: false*/

app.get('/', function (request, response) {
  response.send(jade.renderFile(
    'templates/base.jade',
    {
      pretty: true,
      user: request.user
    }
  ));
});
app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback', passport.authenticate(
  'facebook',
  {successRedirect: '/', failureRedirect: '/failed'}
));
app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

/*jslint unused: true*/
var server = app.listen(config.server.port, function () {
  console.log('Listening to ' + config.server.url);
});
/*jslint unused: false*/
