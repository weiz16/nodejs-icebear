var express = require('express');
var router = express.Router();
var passport = require('passport');
var db = require('../database')();

var emailManager = require('../emailer')();
var config = require('../config/config')();
var helper = require('../helper')(db.con);


require('../passport');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.send('Ice bear - Restful API ');
});


/**
 * User login.
 * Check login detail
 * Check if user verified.
 * Create access token that is valid for 30 minute.
 * Front end will need to perform a login every 30 minute to gain access
 * to the system after the token expires.
 */

router.post('/login', function (req, res) {


  let email = req.body.email;
  let password = req.body.password;
  helper.isAllArgumentProvided(['email', 'password'], req.body)
    .then(ok => helper.isEmailLegal(req.body.email))
    .then(ok => helper.isPasswordValid(req.body.password))
    .then(ok => db.findByEmail(email))
    .then(function (user) {
      db.comparePassword(password, user)
        .then(ok => db.createToken(user['userId'], 20, config.securityConfig.accessToken))
        .then(token => res.json({ success: true, message: token, verified: user['emailVerified'] }))
        .catch(err => res.json({ success: false, message: err }));
    })
    .catch(err => res.json({ success: false, message: err }));

});


router.post('/email-verified', function (req, res) {
  let token = req.body.token;
  helper
    .isAllArgumentProvided(['token'], req.body)
    .then(ok => helper.isTokenSignedByServer(token))
    .then(function (response) {
      helper.isTokenValid(response.decoded, config.securityConfig.accessToken)
        .then(ok => res.json({ success: true, message: response.user }))
        .catch(err => res.json({ success: false, message: err }));
    })
    .catch(err => res.json({ success: false, message: err }));

});

/**
 * Sign up
 */
router.post('/signup', function (req, res) {
  // sign up in db
  helper
    .isAllArgumentProvided(['password', 'email'], req.body)
    // .then(ok => helper.isUsernameLegal(req.body.username))
    .then(ok => helper.isEmailLegal(req.body.email))
    .then(ok => helper.isPasswordValid(req.body.password))
    .then(ok => db.signUp(req.body.password, req.body.email))
    .then(userId => db.createToken(userId, 1, config.securityConfig.accessToken))
    .then(token => {
      res.json({ success: true, message: 'ok' });
    })
    .catch(err => { res.json({ success: false, message: err }) });

});


router.get('/verify-email/:token', function (req, res) {
  helper.isTokenSignedByServer(req.params.token)
    .then(function (response) {
      db.isEmailVerified(response)
        .then(ok => helper.isTokenValid(response.decoded, config.securityConfig.activationToken))
        .then(ok => db.activateUser(response.user.userId))
        .then(ok => res.redirect('https://www.lemonhouse.tk'))
        // .then(ok => res.json({ success: true, message: 'Activation complete.' }))
        .catch(err => {
          res.status(200).json({ success: false, message: err });
        });

    })
    .catch(err => {
      res.status(200).json({ success: false, message: err });
    });

});



router.post('/resend-activation-token', function (req, res) {

  var email = req.body.email;
  var password = req.body.password;

  helper.isAllArgumentProvided(['token'], req.body)
    .then(ok => helper.isTokenSignedByServer(req.body.token))
    .then(function (response) {
      db.updateActivationToken(response.user.userId, 1, config.securityConfig.activationToken)
        .then(token => {
          emailManager.sendWelcomeEmail(response.user['email'], 'Ice Bear', token);
          res.json({ success: true, message: 'A verification email has now been sent to your email account.' });
        })
        .catch(err => res.json({ success: false, message: err }));
    })
    .catch(err => res.json({ success: false, message: err }));

});

/**
 * Reset password.
 * check if the token is signed by server 
 * check if the token has expires or not 
 * check if the token is the correct type or not.
 *  redirect user to login page. 
 */
router.post('/reset-password', function (req, res) {
  var token = req.body['token'];
  var password = req.body['password'];
  helper
    .isAllArgumentProvided(['token', 'password'], req.body)
    .then(ok => helper.isTokenSignedByServer(token))
    .then(response => helper.isTokenValid(response.decoded, config.securityConfig.resetToken))
    .then(ok => helper.isPasswordValid(req.body.password))
    .then(ok => db.changePassword(token, password))
    .then(ok => db.removeOldToken(token))
    .then(ok => res.json({ success: true, message: 'Password updated.' }))
    .catch(err => res.json({ success: false, message: err }))
});

router.post('/update-password', function (req, res) {
  var token = req.body['token'];
  var password = req.body['password'];
  var newPassword = req.body['newPassword'];

  helper
    .isAllArgumentProvided(['token', 'password', 'newPassword'], req.body)
    .then(ok => helper.isTokenSignedByServer(token))
    .then(function (response) {
      helper.isTokenValid(response.decoded, config.securityConfig.accessToken)
        .then(ok => helper.isPasswordValid(newPassword))
        .then(ok => db.comparePassword(password, response.user))
        .then(ok => db.changePassword(token, newPassword))
        .then(ok => res.json({ success: true, message: ok }))
        .catch(err => res.json({ success: false, message: err }))
    }
    )
    .catch(err => res.json({ success: false, message: err }))
});
/**
 * Forgot password. 
 * check if email exsit or not. 
 * if so, remove old token if exsit.
 * and create a new token. 
 * then, send new token to user's email.
 */
router.post('/forgot-password', function (req, res) {
  let email = req.body.email;

  db.isEmailExsited(email)
    .then(user => {
      db.createToken(user['id'], 0.5, config.securityConfig.resetToken)
        .then(ok => emailManager.sendTokenToUserEmail(email, email, ok))
        .then(ok => res.json({ success: true, message: "Check your email." }))
        .catch(err => res.json({ success: false, message: err }));

    }).catch(err => res.json({ success: false, message: err }));

});

router.post('/forgot-username', function (req, res) {
  let email = req.body.email;
  db
    .isEmailExsited(email)
    .then(user => helper.isEmailVerified(user))
    .then(ok => db.getUsernameByEmail(req.body.email))
    .then(username => {
      res.json({ success: true, message: 'Your username will be sent to your email.' });
      emailManager.sendUsernameToEmail(req.body.email, username);
    })
    .catch(error => { res.json({ success: false, message: error }) })
});


router.post('/forgot-password', function (req, res) {

  db.getUsernameByEmail(req.body.email).then(function (username) {
    res.send(JSON.stringify({ message: 'A reset link will be sent to your email address.' }, null, 3));
    emailManager.sendTokenToUserEmail(req.body.email, username, '32J5BL251212JOBN4');
  }, function (error) {
    res.send(error);
  });
});


router.get('/users', passport.authenticate('local'), function (req, res) {
  res.send('list of uers');
});

router.put('/user', function (req, res) {
  res.send('Got a PUT request at /user');
  failureFlash: 'Cant access!.';
});

router.delete('/user', function (req, res) {
  res.send('Got a DELETE request at /user')
});


router.get('/food/:name', function (req, res) {
  // res.send();
  db.getMenu(req.params.name, function (result) {
    res.setHeader('Content-Type', 'application/json');
    res.send(result);
  });
})

router.get('/test', function (req, res) {
  res.json('Test ok.');
});


module.exports = router;
