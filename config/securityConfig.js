

let dev_security_settings = {
  cert: "xxxxxxx",
  activationToken: 1,
  accessToken: 2,
  resetToken: 3,
  shopOwnerToken: 4,
  saltFactor: 1,
  accessType: {
    read: 0,
    write: 1,
    rw: 2,
  }
};

let prod_security_settings = {
  cert: "xxxxxxxx",
  activationToken: 1,
  accessToken: 2,
  resetToken: 3,
  shopOwnerToken: 4,
  saltFactor: 15,
};

module.exports = {
  dev_security_settings, prod_security_settings
}
