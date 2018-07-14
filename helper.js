const crypto = require('crypto');
var config = require('./config/config')();
var jwt = require('jsonwebtoken');
const mysql = require('mysql');

module.exports = function () {

  var module = {};

  function insertSqlStatement(table, statement, objs) {

    var sqlStatement = "INSERT INTO " + table + '(' + statement + ') VALUES (';


    var i;
    for (i = 0; i < objs.length; i++) {
      if (i == objs.length - 1) {
        sqlStatement += mysql.escape(objs[i]) + ')';
      } else {
        sqlStatement += mysql.escape(objs[i]) + ',';
      }
    }

    return sqlStatement;

  }


  function updateSqlStatement(table, setObjs, selectors) {

    var sqlStatement = "UPDATE " + table + ' SET ';
    // var i;

    // for (let key of Object.keys(setObjs)) {
    //   sqlStatement += " "  + key + " = " + setObjs[key];  
    // }
    return sqlStatement;
  }

  function deleteSqlStatement(table, selectors, operators, targets) {

    var sqlStatement = "DELETE FROM " + table + ' WHERE ';
    var i;

    for (i = 0; i < selectors.length; i++) {
      if (selectors.length < 1) {
        sqlStatement += selectors[i] + " " + operators[i] + mysql.escape(targets[i]);
      } else {
        if (i == selectors.length - 1) {
          sqlStatement += selectors[i] + " " + operators[i] + mysql.escape(targets[i]);
        } else {
          sqlStatement += selectors[i] + " " + operators[i] + mysql.escape(targets[i]) + " AND ";
        }
      }
    }
    return sqlStatement;
  }

  function selectSqlStatement(table, selector, compare, operator, target) {
    var sqlStatement = "SELECT " + selector + ' FROM ' + table;
    if (operator) {
      sqlStatement += ' WHERE ' + compare + ' ' + operator + ' ' + mysql.escape(target)
    }
    return sqlStatement;
  }

  function createRandomUniqueId(bytes, type) {
    return crypto.randomBytes(bytes).toString(type);
  }


  // hash a given password password 
  function hasher(password, salt) {

    return new Promise(function (resolve, reject) {
      crypto.pbkdf2(password, salt, 100, 64, 'sha256', (err, key) => {
        if (err) return reject(err);
        else {
          return resolve({ salt: salt, hash: key.toString('hex') });
        }
      });
    });
  }

  /** 
   * Create a random and unique token.
   */
  function generateToken(expiresIn, type) {


    return new Promise(function (resolve, reject) {

      let time = getExpireIn(expiresIn);

      // Use random unique, so the token is not predicatable 
      var tokenId = createRandomUniqueId(20, 'hex');
      jwt.sign(
        {
          exp: time, data: { type: type, tokenId: tokenId }
        },
        config.securityConfig.cert,
        function (err, token) {

          if (err) {
            return reject(err);
          } else {
            return resolve(token);
          }

        });
    })

  }

  function getExpireIn(perHour) {
    return Math.floor(Date.now() / 1000) + (60 * 60 * perHour);
  }

  /**
   * Check whether a given token is signed by server 
   * Check db to validate the token signaure. This way, 
   * Unless both secret key and db is compromised, the token can't be
   * tempering with. 
   * @param {*} token token to be checked.
   */
  function isTokenSignedByServer(token) {



    return new Promise(function (resolve, reject) {

      var connection = mysql.createConnection({
        host: config.dbConfig.host,
        user: config.dbConfig.user,
        password: config.dbConfig.password,
        database: config.dbConfig.database,
      });


      connection.connect();
      var decoded = jwt.decode(token, config.securityConfig.cert);
      if (decoded) {

        // var sql = "SELECT * FROM users WHERE token = " + mysql.escape(token);
        if (decoded.data.type == config.securityConfig.accessToken) {
          var sql = "SELECT * FROM users WHERE token = " + mysql.escape(token);
        } else {
          console.log('activation type');
          var sql = "SELECT * FROM token WHERE token = " + mysql.escape(token);
        }


        connection.query(sql, function (err, result) {
          connection.destroy();
          if (err) {
            return reject(err.code);
          }
          if (result.length < 1) return reject('Token does not exsit.');
          else {
            return resolve({ decoded, user: result[0] });
          }
        });





      } else {
        return reject('Token not signed by server.');
      }
    });

  }

  /**
   * Check expire time and type matched.
   * @param {*} decoded decdoed token
   * @param {*} type type to check with
   */
  function isTokenValid(decoded, type) {

    return new Promise(function (resolve, reject) {
      if (decoded['exp'] - Math.floor(Date.now() / 1000) <= 0)
        return reject('Token has expired');
      if (type != decoded['data'].type)
        return reject('Incorrect Token type');
      else {
        return resolve('Token valid.');
      }
    });
  }

  function isEmailVerified(response) {
    // console.log(user);
    return new Promise(function (resolve, reject) {
      if (response.user['emailVerified']) return resolve(response);
      return reject('Please verify your email address first.');
    });
  }

  function isAllArgumentProvided(params, obj) {
    return new Promise(function (resolve, reject) {
      if (!obj) return reject("Missing parameters.");
      for (let param of params) {
        if (!obj[param]) return reject("Missing parameters - [ " + param + " ]");
      }
      return resolve('ok');
    });
  }

  function isUsernameLegal(username) {
    return new Promise(function (resolve, reject) {
      if (/[^a-zA-Z0-9]/.test(username)) {
        reject('Username should only contain letters and numbers.');
      } else {
        resolve('ok');
      }
    });
  }
  function isEmailLegal(email) {
    return new Promise(function (resolve, reject) {
      if (/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
        .test(email)) {
        resolve('ok');
      } else {
        reject('Incorrect email format.');
      }
    });
  }

  function isPasswordValid(password) {
    return new Promise(function (resolve, reject) {
      if (password.length < 20) resolve();
      else reject('Password should not be more than 20 characters.')
    });
  }

  function calcTotal(order, type) {
    let total = 0.0;
    for (let item of order['order']) {
      total += parseFloat(item.MenuPrice) * parseInt(item.quantity);
    }
    if (type > 1) {
      total += 1.0;
    }
    return total.toFixed(2);
  }

  module = {
    hasher: hasher,
    createRandomUniqueId: createRandomUniqueId,
    insertSqlStatement: insertSqlStatement,
    selectSqlStatement: selectSqlStatement,
    generateToken: generateToken,
    deleteSqlStatement: deleteSqlStatement,
    isTokenSignedByServer: isTokenSignedByServer,
    isTokenValid: isTokenValid,
    isEmailVerified: isEmailVerified,
    isAllArgumentProvided: isAllArgumentProvided,
    isUsernameLegal: isUsernameLegal,
    isEmailLegal: isEmailLegal,
    isPasswordValid: isPasswordValid,
    calcTotal: calcTotal
  }
  return module;
}
