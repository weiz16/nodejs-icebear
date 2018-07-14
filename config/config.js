let security = require('./securityConfig');
let db = require('./dbConfig');
module.exports = function () {

  switch (process.env.NODE_ENV) {
    case "development":

      return {
        dbConfig: db.dev_db_settings,
        securityConfig: security.dev_security_settings,
      };
    case "production":
      return {
        dbConfig: db.prod_db_settings,
        securityConfig: security.prod_security_settings,

      };
    default:
      return {
        dbConfig: db.dev_db_settings,
        securityConfig: security.dev_security_settings,
      };
  }
};
