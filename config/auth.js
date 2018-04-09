// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth' : {
        'clientID'        : '1441533179394758', // your App ID
        'clientSecret'    : '10df5ddc29567e9d440de0e996dd5f82', // your App Secret
        'callbackURL'     : 'http://login-demo.kontami.ml/auth/facebook/callback',
        'profileURL': 'https://graph.facebook.com/v2.9/me?fields=first_name,last_name,email',
        'profileFields'   : ['id', 'email', 'name'] // For requesting permissions from Facebook API
    },

    'twitterAuth' : {
        'consumerKey'        : 'your-consumer-key-here',
        'consumerSecret'     : 'your-client-secret-here',
        'callbackURL'        : 'http://localhost:8080/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'         : '286871931908-4c482j5vnodm9go07fekvr8km6eqtk9i.apps.googleusercontent.com',
        'clientSecret'     : 'TtyJ8FnFONPyvYXpKbdI2Gdq',
        'callbackURL'      : 'http://login-demo.kontami.ml/auth/google/callback'
    }

};
