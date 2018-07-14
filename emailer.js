module.exports = function () {

  var gmail = require('./gmail')();
  var fs = require('fs');
  var handlebars = require('handlebars');

  var module = {};

  var readHTMLFile = function (path, callback) {
    fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {
      if (err) {
        throw err;
        callback(err);
      }
      else {
        callback(null, html);
      }
    });
  };



  function sendUsernameToEmail(email, username) {


    readHTMLFile(__dirname + '/resources/email_template/forgot_username.html', function (err, html) {
      var template = handlebars.compile(html);
      var replacements = {
        username: username
      };
      var htmlToSend = template(replacements);

      gmail.sendEmail(
        'icebeardoesntlikefish@gmail.com',
        email,
        'Forgotten username',
        htmlToSend);

    });


  }


  function sendTokenToUserEmail(email, username, token) {

    return new Promise(function (resolve, reject) {
      readHTMLFile(__dirname + '/resources/email_template/forgot_password.html', function (err, html) {
        var template = handlebars.compile(html);
        var replacements = {
          username: username,
          url: "https://protected-wildwood-23463.herokuapp.com/api/reset-password/" + token,
        };
        var htmlToSend = template(replacements);
        resolve();
        gmail.sendEmail(
          'icebeardoesntlikefish@gmail.com',
          email,
          'Reset your password.',
          htmlToSend);

      });
    });


  };

  function sendWelcomeEmail(email, username, token) {
    return new Promise(function (resolve, reject) {
      readHTMLFile(__dirname + '/resources/email_template/welcome.html', function (err, html) {
        var template = handlebars.compile(html);
        var replacements = {
          username: username,
          url: "https://protected-wildwood-23463.herokuapp.com/api/verify-email/" + token,
        };
        var htmlToSend = template(replacements);

        gmail.sendEmail(
          'icebeardoesntlikefish@gmail.com',
          email,
          'Welcome to Ice Bear`s Cave',
          htmlToSend);
      });
    });
  }

  // switch (process.env.NODE_ENV) {
  //   case 'development':
  //     module = {
  //       sendUsernameToEmail: sendUsernameToEmail,
  //       sendTokenToUserEmail: sendTokenToUserEmail,
  //       sendWelcomeEmail: sendWelcomeEmail,
  //     }
  //     break;

  //   case 'production':
  //     module = {
  //       sendUsernameToEmail: sendUsernameToEmail,
  //       sendTokenToUserEmail: sendTokenToUserEmail,
  //       sendWelcomeEmail: sendWelcomeEmail,
  //     }
  //     break;

  //   default:
  //     module = {
  //       sendUsernameToEmail: sendUsernameToEmail,
  //       sendTokenToUserEmail: sendTokenToUserEmail,
  //       sendWelcomeEmail: sendWelcomeEmail,
  //     }
  //     break;
  // }

  function sendTestMail() {
    console.log('SEND TEST EMAIL.');

    readHTMLFile(__dirname + '/resources/email_template/welcome.html', function (err, html) {
      var template = handlebars.compile(html);
      var replacements = {
        username: '123',
        url: "https://protected-wildwood-23463.herokuapp.com/api/verify-email/" + '123',
      };
      var htmlToSend = template(replacements);
      gmail.sendEmail('icebeardoesntlikefish@gmail.com', 'icebeardoesntlikefish@gmail.com', 'Test html email', htmlToSend);

    });
  }


  module = {
    sendTestMail: sendTestMail,
    sendUsernameToEmail: sendUsernameToEmail,
    sendTokenToUserEmail: sendTokenToUserEmail,
    sendWelcomeEmail: sendWelcomeEmail,
  }
  return module;
} 
