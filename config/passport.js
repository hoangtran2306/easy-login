// load all the things we need
var LocalStrategy    = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy  = require('passport-twitter').Strategy;
var GoogleStrategy   = require('passport-google-oauth').OAuth2Strategy;
var request = require('request-promise');

// load up the user model
var User       = require('../app/models/user');

// load the auth variables
var configAuth = require('./auth'); // use this one for testing

module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    // used to deserialize the user
    passport.deserializeUser(function(user, done) {
        done(null, user);
    });

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, email, password, done) {
        // if (email)
        //     email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

        // asynchronous
        process.nextTick(function() {
            const options = {
                method: 'POST',
                uri: 'http://api.kontami.ml/auth',
                body: {
                    usernameOrEmailOrPhone: email,
                    password: password,
                    provider: 'local'
                },
                json: true,
                encoding: 'utf8'
            };
            // console.log('test')
            var access_token;

            request(options)
                .then(function (res){
                    var newUser            = {};
                    access_token = res.accessToken;
                    if (!access_token)
                        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
                    newUser.facebook = {}
                    newUser.local = {}
                    newUser.twitter = {}
                    newUser.google = {}
                    newUser._id = 'id'
                    newUser.local.email = email
                    newUser.local.password = password
                    newUser.access_token = access_token
                    console.log(newUser)
                    return done(null, newUser);
                });
        });

    }));

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, email, password, done) {
        // if (email)
        //     email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

        // asynchronous
        process.nextTick(function() {
            const options = {
                method: 'POST',
                uri: 'http://api.kontami.ml/auth',
                body: {
                    usernameOrEmailOrPhone: usernameField,
                    password: passwordField,
                    provider: 'local'
                },
                json: true,
                encoding: 'utf8'
            };
            // console.log('test')
            var access_token;
            
            // var test = JSON.parse(request(options)
            //     .then(res => res)).access_token;
            
            // check if the user is already logged in

            request(options)
                .then(function (res){
                    var newUser            = {};
                    access_token = res.accessToken;
                    newUser.facebook = {}
                    newUser.local = {}
                    newUser.twitter = {}
                    newUser.google = {}
                    newUser.access_token = access_token
                    console.log(newUser.access_token)
                    return done(null, newUser);
                });
        });

    }));

    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    var fbStrategy = configAuth.facebookAuth;
    fbStrategy.passReqToCallback = true;  // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    passport.use(new FacebookStrategy(fbStrategy,
    function(req, token, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {
            const options = {
                method: 'POST',
                uri: 'http://api.kontami.ml/auth',
                body: {
                    socialToken: token,
                    provider: 'facebook'
                },
                json: true,
                encoding: 'utf8'
            };
            // console.log('test')
            var access_token;
            
            // var test = JSON.parse(request(options)
            //     .then(res => res)).access_token;
            
            // check if the user is already logged in

            request(options)
                .then(function (res){
                    var newUser            = {};
                    access_token = res.accessToken;
                    newUser.facebook = {}
                    newUser.local = {}
                    newUser.twitter = {}
                    newUser.google = {}
                    newUser.facebook.id    = profile.id;
                    newUser.facebook.token = token;
                    newUser.access_token = access_token
                    newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                    newUser.facebook.email = (profile.emails[0].value || '').toLowerCase();
                    console.log(newUser.access_token)
                    return done(null, newUser);
                });
        });

    }));

    // =========================================================================
    // TWITTER =================================================================
    // =========================================================================
    passport.use(new TwitterStrategy({

        consumerKey     : configAuth.twitterAuth.consumerKey,
        consumerSecret  : configAuth.twitterAuth.consumerSecret,
        callbackURL     : configAuth.twitterAuth.callbackURL,
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

    },
    function(req, token, tokenSecret, profile, done) {

        // asynchronous
        process.nextTick(function() {

            // check if the user is already logged in
            if (!req.user) {

                User.findOne({ 'twitter.id' : profile.id }, function(err, user) {
                    if (err)
                        return done(err);

                    if (user) {
                        // if there is a user id already but no token (user was linked at one point and then removed)
                        if (!user.twitter.token) {
                            user.twitter.token       = token;
                            user.twitter.username    = profile.username;
                            user.twitter.displayName = profile.displayName;

                            user.save(function(err) {
                                if (err)
                                    return done(err);
                                    
                                return done(null, user);
                            });
                        }

                        return done(null, user); // user found, return that user
                    } else {
                        // if there is no user, create them
                        var newUser                 = new User();

                        newUser.twitter.id          = profile.id;
                        newUser.twitter.token       = token;
                        newUser.twitter.username    = profile.username;
                        newUser.twitter.displayName = profile.displayName;

                        newUser.save(function(err) {
                            if (err)
                                return done(err);
                                
                            return done(null, newUser);
                        });
                    }
                });

            } else {
                // user already exists and is logged in, we have to link accounts
                var user                 = req.user; // pull the user out of the session

                user.twitter.id          = profile.id;
                user.twitter.token       = token;
                user.twitter.username    = profile.username;
                user.twitter.displayName = profile.displayName;

                user.save(function(err) {
                    if (err)
                        return done(err);
                        
                    return done(null, user);
                });
            }

        });

    }));

    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    passport.use(new GoogleStrategy({

        clientID        : configAuth.googleAuth.clientID,
        clientSecret    : configAuth.googleAuth.clientSecret,
        callbackURL     : configAuth.googleAuth.callbackURL,
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

    },
    function(req, token, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {
            const options = {
                method: 'POST',
                uri: 'http://api.kontami.ml/auth',
                body: {
                    socialToken: token,
                    provider: 'google'
                },
                json: true,
                encoding: 'utf8'
            };
            // console.log('test')
            var access_token;
            
            // var test = JSON.parse(request(options)
            //     .then(res => res)).access_token;
            
            // check if the user is already logged in

            request(options)
                .then(function (res){
                    var newUser            = {};
                    access_token = res.accessToken;
                    newUser.facebook = {}
                    newUser.local = {}
                    newUser.twitter = {}
                    newUser.google = {}
                    newUser.access_token = access_token
                    newUser.google.id    = profile.id;
                    newUser.google.token = token;
                    newUser.google.name  = profile.displayName;
                    newUser.google.email = (profile.emails[0].value || '').toLowerCase();
                    console.log(newUser.access_token)
                    return done(null, newUser);
                });
        });

    }));

};
