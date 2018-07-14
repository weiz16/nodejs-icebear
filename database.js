
var config = require('./config/config')();
var bcrypt = require('bcrypt-nodejs');
var mysql = require('mysql');
var emailManager = require('./emailer')();


module.exports = function () {




  var module = {};


  var con = mysql.createConnection({
    host: config.dbConfig.host,
    user: config.dbConfig.user,
    password: config.dbConfig.password,
    database: config.dbConfig.database,
  });

  const helper = require('./helper')(con);


  function signUp(password, email) {

    var userId = helper.createRandomUniqueId(20, 'hex');

    return new Promise(function (resolve, reject) {

      var salt = bcrypt.genSaltSync(config.securityConfig.saltFactor);
      var hash = bcrypt.hashSync(password, salt);

      if (!salt || !hash) {
        reject('Failed to hash');
      }

      var insertSql = helper.insertSqlStatement('users',
        'userId,password,email',
        [userId, hash, email]
      );


      connectAndQuery(insertSql, function (err, result) {
        if (err) {
          if (err == 'ER_DUP_ENTRY') return reject('Email already exsit.');
          else return reject(err);
        } else {
          createActivationToken(userId, 24, config.securityConfig.activationToken)
            .then(token => {
              emailManager.sendWelcomeEmail(email, email, token);
            })
          return resolve(userId);
        }

      });

    });

  }




  function findByUsername(username) {

    return new Promise(function (resolve, reject) {
      connectAndQuery("SELECT * FROM users WHERE username = '" + username + "'", function (err, result) {
        if (err) return reject();

        if (result.length < 1)
          return reject('Username not found.');
        return resolve(result[0]);
      });
    });

  };


  function connectAndQuery(sql, cb) {

    let connection = mysql.createConnection({
      host: config.dbConfig.host,
      user: config.dbConfig.user,
      password: config.dbConfig.password,
      database: config.dbConfig.database,
    });

    connection.connect();
    connection.query(sql, function (err, result) {
      connection.destroy();
      if (err) {
        cb(err.code, result);
      } else {
        cb(null, result);
      }

    });


  }


  function findByEmail(email) {

    return new Promise(function (resolve, reject) {
      connectAndQuery("SELECT * FROM users WHERE email = '" + email + "'", function (err, result) {
        if (err) return reject();

        if (result.length < 1)
          return reject('Email not found.');
        return resolve(result[0]);
      });
    });

  };

  function findById(id, cb) {
    connectAndQuery("SELECT * FROM users WHERE id = '" + id + "'", function (err, result, fields) {
      if (err) { return cb(err); }
      return cb(null, result[0]);
    });
  };


  function createOrder(shop, userId, items, cb) {

    var itemSql;

    for (let item of items) {
      itemSql = "INSERT INTO users(id,shopId,tableId,items) VALUES ("
    }


    var sql = "INSERT INTO users(id,shopId,tableId,items) VALUES (";

    sql = sql + con.escape(id) + ','
      + con.escape(username) + ','
      + con.escape(obj.hash) + ','
      + con.escape(obj.salt) + ','
      + con.escape(email) + ")";

    return cb(JSON.stringify(
      {
        message: 'recieved a new order',
        items: "[1],[2],[3]",
        from: 'Table 1',
        itemId: '015ASD',
        status: 'await approval',
      }
    ));
  }


  function getOrder(id, cb) {
    return cb(JSON.stringify({
      "users": [
        { name: 'john' },
        { name: 'john2' },
        { name: 'john3' },
        { name: 'john4' },
        { name: 'john5' }
      ]
    }, null, 3));
  }

  function getUsernameByEmail(email) {

    var sqlQuery = helper.selectSqlStatement('users', 'username', 'email', '=', email);

    return new Promise(function (resolve, reject) {
      connectAndQuery(sqlQuery, function (err, result) {
        if (err) return reject(JSON.stringify({ error: err }));
        if (result.length < 1) return reject(JSON.stringify({ error: 'Eamil does not exsit.' }, null, 3));
        return resolve(result[0]['username']);
      });
    });

  }

  /**
   * Generate an new token given a userId and a expireIn.
   * e.g. a expireIn -> 1 = one hour, 0.5 = 30 minutes.
   */
  function generateResetToken(userId, expiresIn) {
    var tokenId = helper.createRandomUniqueId(20, 'hex');

    return new Promise(function (resolve, reject) {

      // Call helper funtion to created signed token
      helper.generateToken(tokenId, config.securityConfig.resetToken, expiresIn).then(res => {
        var insertSql = helper.insertSqlStatement('token', 'tokenId,userId,expiresIn,type', [
          tokenId, userId, res.time, config.securityConfig.resetToken
        ]);


        // Add generated token to the database.
        connectAndQuery(insertSql, function (err, result) {

          if (err) return reject('Failed to genearet token.');

          return resolve(res.token);
        })
      }).catch(err => {

        return reject(err);
      });

    });
  }



  /**
   * Given a to-be-compared password agasint what we have in the db.
   * @param {*} userEntry user input
   * @param {*} dbEntry  database input
   */
  function comparePassword(userEntry, dbEntry) {
    return new Promise(function (resolve, reject) {
      bcrypt.compare(userEntry, dbEntry['password'], function (err, isMatched) {
        if (err) return reject(err);
        if (!isMatched) return reject('Incorrect password!');
        if (isMatched) return resolve(dbEntry);
      });
    });
  }

  /**
   * Activate user given a userId
   */
  function activateUser(userId) {
    return new Promise(function (resolve, reject) {
      var sql = "UPDATE users SET emailVerified = 1 WHERE userId = " + con.escape(userId);
      // console.log()
      connectAndQuery(sql, function (err, result) {
        if (err) return reject('SQL Error.');
        else return resolve('ok');
      });
    });
  }

  /**
   * Generate a unqiue token id first
   * @param {*} userId database object
   * @param {*} expiresIn expiration time for this token, 1 = 1 hour, 0.5 = 30 minutes etc..
   * @param {*} type type of token this is, it is a access token, a reset token ...
   */
  function createToken(userId, expiresIn, type) {



    return new Promise(function (resolve, reject) {
      helper.generateToken(expiresIn, type).then((token) => {
        var insertSql = "UPDATE users SET token = " + con.escape(token) + " WHERE userId = " + con.escape(userId);
        connectAndQuery(insertSql, function (err, result) {
          if (err) return reject(err);
          return resolve(token);
        })
      }).catch(err => {
        return reject(err);
      });
    });
  }

  function createActivationToken(userId, expiresIn, type) {
    return new Promise(function (resolve, reject) {
      helper.generateToken(expiresIn, type).then((token) => {
        var insertSql = "INSERT INTO token(userId,token) VALUES ("
          + con.escape(userId) + ','
          + con.escape(token) + ')';
        connectAndQuery(insertSql, function (err, result) {
          if (err) return reject(err);
          return resolve(token);
        })
      }).catch(err => {
        return reject(err);
      });
    });
  }


  function updateActivationToken(userId, expiresIn, type) {

    return new Promise(function (resolve, reject) {
      helper.generateToken(expiresIn, type).then((token) => {
        var insertSql = "UPDATE token SET token = " + con.escape(token) + " WHERE userId = " + con.escape(userId);
        connectAndQuery(insertSql, function (err, result) {
          if (err) return reject(err);
          return resolve(token);
        })
      }).catch(err => {
        return reject(err);
      });
    });
  }


  function deleteToken(user) {
    let userId = user['id'];
    return new Promise(function (resolve, reject) {
      var sql = "DELETE FROM token where userId  = " + con.escape(userId);
      connectAndQuery(sql, function (err, result) {
        if (err) return reject('Failed to delete token.');
        return resolve(user);
      });
    });

  }

  /**
   * Return a promise for a given emial's verification status. 
   */
  function isEmailVerified(user) {
    return new Promise(function (resolve, reject) {
      if (user['emailVerified']) return reject('Email already verified.');
      else return resolve();
    });
  }

  /**
   * Return userId if email exsit, else, reject.
   */
  function isEmailExsited(email) {
    return new Promise(function (resolve, reject) {
      var sqlQuery = helper.selectSqlStatement('users', '*', 'email', '=', email);
      connectAndQuery(sqlQuery, function (err, result) {
        if (err) reject(err);
        if (result.length < 1) reject('Email not found.');
        return resolve(result[0]);
      });
    });

  }

  /**
   * Remvoe specific token given a token
   */
  function removeOldToken(token) {
    return new Promise(function (resolve, reject) {
      var sql = "UPDATE users SET token = NULL WHERE token = " + con.escape(token);
      connectAndQuery(sql, function (err, result) {
        if (err) {
          return reject(err);
        } else {
          return resolve('OK');
        }
      });
    });
  }

  /**
   * Change password given a reset token and new password
   */
  function changePassword(resetToken, password) {
    return new Promise(function (resolve, reject) {

      var salt = bcrypt.genSaltSync(config.securityConfig.saltFactor);
      var hash = bcrypt.hashSync(password, salt);

      if (!salt || !hash) {
        reject('Failed to hash');
      }

      var sql =
        "UPDATE users SET " + "password = " + con.escape(hash) + " WHERE " + "token" + " = " + con.escape(resetToken);


      connectAndQuery(sql, function (err, result) {
        if (err) return reject(err.code);
        return resolve('Your password has been updated.');
      });
    });


  }

  /**
   * Return a token given a userId and token type
   */
  function getToken(userId, type) {
    return new Promise(function (resolve, reject) {
      var sql = "SELECT tokenId from token WHERE userId = " + con.escape(userId) + " AND " + "type = " + type;
      connectAndQuery(sql, function (err, result) {
        if (err) reject(err.code);
        else return result[0]['tokenId'];
      });
    });
  }
  /**
   * Creaet Access token for a given user and a givne period.
   */
  function createAccessToken(userId) {
    return this.createToken()
  }

  function test() {
    console.log('test.....');
  }
  module = {

    signUp: signUp,
    findById: findById,
    findByUsername: findByUsername,
    findByEmail: findByEmail,
    createOrder: createOrder,
    getOrder: getOrder,
    getUsernameByEmail: getUsernameByEmail,
    generateResetToken: generateResetToken,
    createActivationToken: createActivationToken,
    updateActivationToken: updateActivationToken,
    comparePassword: comparePassword,
    activateUser: activateUser,
    createToken: createToken,
    deleteToken: deleteToken,
    isEmailVerified: isEmailVerified,
    isEmailExsited: isEmailExsited,
    removeOldToken: removeOldToken,
    changePassword: changePassword,
    getToken: getToken,
    con: con,
    test: test,
    connectAndQuery: connectAndQuery,
    // order: order

  }
  return module;

}











