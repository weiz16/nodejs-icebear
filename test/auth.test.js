const expect = require('expect');
const request = require('supertest');

const { app } = require('../server');
const db = require('../database')();
const helper = require('../helper')(db.con);

// Clear tables

db.con.query("Truncate table users");

describe('POST /signup', () => {
    it('Should create a user ', (done) => {
        request(app)

            .post('/api/signup')
            .set('Accept', 'application/json')
            .send(
                {
                    "username": "icebear",
                    "password": "doesntlikefish",
                    "email": "icebeardoesntlikefish@gmail.com"
                }
            )
            .expect(200, {
                success: true,
                message: 'ok',
            }).end((err, res) => {
                if (err) {
                    done(err);
                }
                else {
                    db.findByUsername('icebear').then(result => {
                        expect(result.username).toBe("icebear")
                        done()
                    }).catch(err => done(err))
                }
            })
    })

    it('Should reject duplicate username ', (done) => {
        request(app)

            .post('/api/signup')
            .set('Accept', 'application/json')
            .send(
                {
                    "username": "icebear",
                    "password": "doesntlikefish",
                    "email": "icebeardoesntlikefish123@gmail.com"
                }
            )
            .expect(200)
            .expect((res) => {
                // expect(res.body.message).toBe('ok')
                expect(res.body.success).toBe(false)
            }).end((err, res) => {
                if (err) {
                    done(err);
                }
                done();
            })
    })

    it('Should reject duplicate email ', (done) => {
        request(app)

            .post('/api/signup')
            .set('Accept', 'application/json')
            .send(
                {
                    "username": "icebear123",
                    "password": "doesntlikefish",
                    "email": "icebeardoesntlikefish@gmail.com"
                }
            )
            .expect(200)
            .expect((res) => {
                // expect(res.body.message).toBe('ok')
                expect(res.body.success).toBe(false)
            }).end((err, res) => {
                if (err) {
                    done(err);
                } else {
                    done();
                }
            })
    })


    it('Should only accept username with alphabetic and character only ', (done) => {
        request(app)

            .post('/api/signup')
            .set('Accept', 'application/json')
            .send(
                {
                    "username": "icebear//..@",
                    "password": "doesntlikefish",
                    "email": "icebeardoesntlikefish12@gmail.com"
                }
            )
            .expect(200, {
                success: false,
                message: 'Username should only contain letters and numbers.'
            })
            .end((err, res) => {
                if (err) {
                    done(err);
                } else {
                    done();
                }
            })
    })

    it('Should not accept username with space. ', (done) => {
        request(app)

            .post('/api/signup')
            .set('Accept', 'application/json')
            .send(
                {
                    "username": "username with space",
                    "password": "doesntlikefish",
                    "email": "email1est@gmail.com"
                }
            )
            .expect(200, {
                success: false,
                message: 'Username should only contain letters and numbers.'
            })
            .end((err, res) => {
                if (err) {
                    done(err);
                } else {
                    done();
                }
            })
    })

    it('Should reject invalid username', (done) => {


        request(app)
            .post('/api/login')
            .set('Accept', 'application/json')
            .send(
                {
                    "username": "icebear@",
                    "password": "doesntlikefish",
                    "email": "ICEBEARDOESNTLIKEFISH@gmail.com"
                }
            )
            .expect(200, {
                success: false,
                message: 'Username should only contain letters and numbers.'
            })
            .end((err, res) => {
                if (err) {
                    done(err);
                } else {
                    done();
                }
            })
    })


    it('Should reject invalid password', (done) => {


        request(app)
            .post('/api/login')
            .set('Accept', 'application/json')
            .send(
                {
                    "username": "icebear123",
                    "password": "doesntlikefish111111111111111111111111111111111111111111111111111111",
                    "email": "ICEBEARDOESNTLIKEFISH11@gmail.com"
                }
            )
            .expect(200, {
                success: false,
                message: 'Password should not be more than 20 characters.'
            })
            .end((err, res) => {
                if (err) {
                    done(err);
                } else {
                    done();
                }
            })
    })

    it('Should not accept email without @. ', (done) => {
        request(app)

            .post('/api/signup')
            .set('Accept', 'application/json')
            .send(
                {
                    "username": "use123",
                    "password": "doesntlikefish",
                    "email": "email1estgmail.com"
                }
            )
            .expect(200, {
                success: false,
                message: 'Incorrect email format.'
            })
            .end((err, res) => {
                if (err) {
                    done(err);
                } else {
                    done();
                }
            })
    })

    it('Should not accept email without .com or other domain ', (done) => {
        request(app)

            .post('/api/signup')
            .set('Accept', 'application/json')
            .send(
                {
                    "username": "use123",
                    "password": "doesntlikefish",
                    "email": "email1estgm@ail"
                }
            )
            .expect(200, {
                success: false,
                message: 'Incorrect email format.'
            })
            .end((err, res) => {
                if (err) {
                    done(err);
                } else {
                    done();
                }
            })
    })

    it('Should not accept email with speical characters ', (done) => {
        request(app)

            .post('/api/signup')
            .set('Accept', 'application/json')
            .send(
                {
                    "username": "use1234",
                    "password": "doesntlikefish",
                    "email": "email1estgm//@gav.com"
                }
            )
            .expect(200, {
                success: false,
                message: 'Incorrect email format.'
            })
            .end((err, res) => {
                if (err) {
                    done(err);
                } else {
                    done();
                }
            })
    })

    it('Should not accept username that are the same regardless the capitalization.', (done) => {
        request(app)

            .post('/api/signup')
            .set('Accept', 'application/json')
            .send(
                {
                    "username": "ICEBEAr",
                    "password": "doesntlikefish",
                    "email": "testase123@gmail.com"
                }
            )
            .expect(200, {
                success: false,
                message: 'ER_DUP_ENTRY',
            })
            .end((err, res) => {
                if (err) {
                    done(err);
                } else {
                    done();
                }
            })
    })

    it('Should not accept email that are the same regardless the capitalization.', (done) => {
        request(app)

            .post('/api/signup')
            .set('Accept', 'application/json')
            .send(
                {
                    "username": "ICEBEARrocks",
                    "password": "doesntlikefish",
                    "email": "ICEBEARDOESNTLIKEFISH@gmail.com"
                }
            )
            .expect(200, {
                success: false,
                message: 'ER_DUP_ENTRY',
            })
            .end((err, res) => {
                if (err) {
                    done(err);
                } else {
                    done();
                }
            })
    })

});



describe('POST /Login', () => {

    it('Should not login unless user email is verified', (done) => {
        request(app)

            .post('/api/login')
            .set('Accept', 'application/json')
            .send(
                {
                    "username": "icebear",
                    "password": "doesntlikefish",
                    "email": "ICEBEARDOESNTLIKEFISH@gmail.com"
                }
            )
            .expect(200, {
                success: false,
                message: 'Please verified your email address.',
            })
            .end((err, res) => {
                if (err) {
                    done(err);
                } else {
                    done();
                }
            })
    })

    it('Should login and return a token', (done) => {

        db.con.query("SELECT userId from users WHERE username = 'icebear'", function (err, result) {
            if (err) { done(new Error(err.code)) }
            else {

                let userId = result[0]['userId'];
                db.createToken(userId, 0.5, 2).then(token => {
                    db.activateUser(userId).then(response => {
                        request(app)
                            .post('/api/login')
                            .set('Accept', 'application/json')
                            .send(
                                {
                                    "username": "icebear",
                                    "password": "doesntlikefish",
                                    "email": "ICEBEARDOESNTLIKEFISH@gmail.com"
                                }
                            )
                            .expect(200)
                            .expect((res) => {
                                expect(res.body.success).toBe(true)
                            })
                            .end((err, res) => {
                                if (err) {
                                    done(err);
                                } else {
                                    done();
                                }
                            })
                    })

                })



            }
        });


    })


    it('Should reject invalid username format', (done) => {


        request(app)
            .post('/api/login')
            .set('Accept', 'application/json')
            .send(
                {
                    "username": "icebear@",
                    "password": "doesntlikefish",
                    "email": "ICEBEARDOESNTLIKEFISH@gmail.com"
                }
            )
            .expect(200, {
                success: false,
                message: 'Username should only contain letters and numbers.'
            })
            .end((err, res) => {
                if (err) {
                    done(err);
                } else {
                    done();
                }
            })
    })


    it('Should reject invalid password format', (done) => {


        request(app)
            .post('/api/login')
            .set('Accept', 'application/json')
            .send(
                {
                    "username": "icebear",
                    "password": "doesntlikefish111111111111111111111111111111111111111111111111111111",
                    "email": "ICEBEARDOESNTLIKEFISH@gmail.com"
                }
            )
            .expect(200, {
                success: false,
                message: 'Password should not be more than 20 characters.'
            })
            .end((err, res) => {
                if (err) {
                    done(err);
                } else {
                    done();
                }
            })
    })


    it('Should reject invalid password', (done) => {


        request(app)
            .post('/api/login')
            .set('Accept', 'application/json')
            .send(
                {
                    "username": "icebear",
                    "password": "doesntlikefish2",
                    "email": "ICEBEARDOESNTLIKEFISH@gmail.com"
                }
            )
            .expect(200, {
                success: false,
                message: 'Password mismatched.'
            })
            .end((err, res) => {
                if (err) {
                    done(err);
                } else {
                    done();
                }
            })
    })

    it('Should reject incorrect username', (done) => {


        request(app)
            .post('/api/login')
            .set('Accept', 'application/json')
            .send(
                {
                    "username": "icebear007",
                    "password": "doesntlikefish2",
                    "email": "ICEBEARDOESNTLIKEFISH@gmail.com"
                }
            )
            .expect(200, {
                success: false,
                message: 'Username not found.'
            })
            .end((err, res) => {
                if (err) {
                    done(err);
                } else {
                    done();
                }
            })
    })

});

// TEST CASE FOR FORGOT-PASSWORD. 
describe('POST /signup', () => {

});


// TEST CASE FOR VERIFY-EMAIL. 
describe('POST /verify-email', () => {
    let firstVerifiedToken;

    it('Should verify user given a correct token ', (done) => {
        // Create fake user
        var userId = helper.createRandomUniqueId(20, 'hex');
        var sql = "INSERT INTO users (userId,username,password,email) VALUES (" +
            db.con.escape(userId) + ","
            + db.con.escape("verifyEmailTone") + ","
            + db.con.escape("verifyEmailTestCaseOne") + ","
            + db.con.escape("verifyEmailTestCaseOne@test.com") + ")";

        db.con.query(sql, function (err, result) {
            if (err) done(new Error(err.code));
            else {


                var tokenId = helper.createRandomUniqueId(20, 'hex');
                helper.generateToken(0.1, 1).then((token) => {

                    var insertSql = "UPDATE users SET token = " + db.con.escape(token) + " WHERE userId = " + db.con.escape(userId);
                    db.con.query(insertSql, function (err, result) {

                        if (err) return done(err.code);
                        else {

                            request(app)

                                .post('/api/verify-email')
                                .set('Accept', 'application/json')
                                .send(
                                    {
                                        "token": token,
                                    }
                                )
                                .expect(200, {
                                    success: true,
                                    message: "Activation complete."
                                }).end((err, res) => {
                                    if (err) {
                                        done(err);
                                    }
                                    else {
                                        firstVerifiedToken = token;
                                        done();
                                    }
                                })
                        }
                    })
                }).catch(err => done(err));


            }
        });
    })

    it('Should not verify user if already verified', (done) => {


        request(app)

            .post('/api/verify-email')
            .set('Accept', 'application/json')
            .send(
                {
                    "token": firstVerifiedToken,
                }
            )
            .expect(200, {
                success: false,
                message: "Email already verified."
            }).end((err, res) => {
                if (err) {
                    done(err);
                }
                else {
                    done();
                }
            })


    });

    it('Should not verify user given a incorrect token ', (done) => {
        // Create fake user
        var userId = helper.createRandomUniqueId(20, 'hex');
        var sql = "INSERT INTO users (userId,username,password,email) VALUES (" +
            db.con.escape(userId) + ","
            + db.con.escape("verifyEmailTwo") + ","
            + db.con.escape("verifyEmailTestCasetwo") + ","
            + db.con.escape("verifyEmailTestCasetwo@test.com") + ")";

        db.con.query(sql, function (err, result) {
            if (err) done(new Error(err.code));
            else {


                var tokenId = helper.createRandomUniqueId(20, 'hex');
                helper.generateToken(0.1, 1).then((token) => {

                    var insertSql = "UPDATE users SET token = " + db.con.escape(token) + " WHERE userId = " + db.con.escape(userId);
                    db.con.query(insertSql, function (err, result) {

                        if (err) return done(err.code);
                        else {

                            request(app)

                                .post('/api/verify-email')
                                .set('Accept', 'application/json')
                                .send(
                                    {
                                        "token": 'Faketoken',
                                    }
                                )
                                .expect(200, {
                                    success: false,
                                    message: "Token not signed by server."
                                }).end((err, res) => {
                                    if (err) {
                                        done(err);
                                    }
                                    else {
                                        done();
                                    }
                                })
                        }
                    })
                }).catch(err => done(err));


            }
        });
    })





    it('Should not verify user if empty token is given', (done) => {


        request(app)

            .post('/api/verify-email')
            .set('Accept', 'application/json')
            .send()
            .expect(200, {
                success: false,
                message: "Missing parameters"
            }).end((err, res) => {
                if (err) {
                    done(err);
                }
                else {
                    done();
                }
            })


    });



    it('Should not verify user given a incorrect token type ', (done) => {
        // Create fake user
        var userId = helper.createRandomUniqueId(20, 'hex');
        var sql = "INSERT INTO users (userId,username,password,email) VALUES (" +
            db.con.escape(userId) + ","
            + db.con.escape("verifyEmailThree") + ","
            + db.con.escape("verifyEmailTestCaseThree") + ","
            + db.con.escape("verifyEmailTestCaseThree@test.com") + ")";

        db.con.query(sql, function (err, result) {
            if (err) done(new Error(err.code));
            else {


                var tokenId = helper.createRandomUniqueId(20, 'hex');
                helper.generateToken(0.1, 2).then((token) => {

                    var insertSql = "UPDATE users SET token = " + db.con.escape(token) + " WHERE userId = " + db.con.escape(userId);
                    db.con.query(insertSql, function (err, result) {

                        if (err) return done(err.code);
                        else {

                            request(app)

                                .post('/api/verify-email')
                                .set('Accept', 'application/json')
                                .send(
                                    {
                                        "token": token,
                                    }
                                )
                                .expect(200, {
                                    success: false,
                                    message: "Incorrect Token type"
                                }).end((err, res) => {
                                    if (err) {
                                        done(err);
                                    }
                                    else {
                                        done();
                                    }
                                })
                        }
                    })
                }).catch(err => done(err));


            }
        });
    })


});



describe('POST /resend-activation-token', () => {



    it('Should resend activation if username and password is correct. ', (done) => {

        db.signUp("resendTokenTestOne", "resendTokenTestOne", "resendTokenTestOne@gmail.com")
            .then(ok => {

                request(app)

                    .post('/api/resend-activation-token')
                    .set('Accept', 'application/json')
                    .send(
                        {
                            "username": "resendTokenTestOne",
                            "password": "resendTokenTestOne",
                        }
                    )
                    .expect(200, {
                        success: true,
                        message: 'ok'
                    })
                    .end((err, res) => {
                        if (err) {
                            done(err);
                        } else {
                            done();
                        }
                    })
            }).catch(err => done(err));

    })

    it('Should not resend activation if password is incorrect. ', (done) => {

        db.signUp("resendTokenTestTwo", "resendTokenTestTwo", "resendTokenTestTwo@gmail.com")
            .then(ok => {

                request(app)

                    .post('/api/resend-activation-token')
                    .set('Accept', 'application/json')
                    .send(
                        {
                            "username": "resendTokenTestTwo",
                            "password": "empty",
                        }
                    )
                    .expect(200, {
                        success: false,
                        message: 'Password mismatched.'
                    })
                    .end((err, res) => {
                        if (err) {
                            done(err);
                        } else {
                            done();
                        }
                    })
            }).catch(err => done(err));

    })


});



describe('POST /reset-password', () => {

    it('Should reset user password is a correct token is given ', (done) => {

        let username = 'resetpassOne'
        let password = 'resetpassOne'
        let email = "resetpassone@gmail.com"
        db
            .signUp(username, password, email)
            .then(function (userId) {
                db.activateUser(userId)
                    .then(ok => db.createToken(userId, 1, 3))
                    .then(token => {
                        request(app)

                            .post('/api/reset-password')
                            .set('Accept', 'application/json')
                            .send(
                                {
                                    "token": token,
                                    "password": "resetpasswordOK",
                                }
                            )
                            .expect(200, {
                                success: true,
                                message: 'Password updated.'
                            })
                            .end((err, res) => {
                                if (err) {
                                    done(err);
                                } else {
                                    let sql = "SELECT * from users WHERE username = " + db.con.escape(username);
                                    db.con.query(sql, function (err, result) {
                                        if (err) done(new Error(err.code));
                                        if (result.length < 1) done(new Error('User not found.'));
                                        else {
                                            db.comparePassword("resetpasswordOK", result[0])
                                                .then(ok => done()).catch(err => done(new Error(err)));
                                        }
                                    });


                                }
                            })
                    })


            }).catch(err => done(err));


    })


    it('Should reject incorrect password format even when a correct token is given ', (done) => {

        let username = 'resetpassTWO'
        let password = 'resetpassTWO'
        let email = "resetpassTWO@gmail.com"
        db
            .signUp(username, password, email)
            .then(function (userId) {
                db.activateUser(userId)
                    .then(ok => db.createToken(userId, 1, 3))
                    .then(token => {
                        request(app)

                            .post('/api/reset-password')
                            .set('Accept', 'application/json')
                            .send(
                                {
                                    "token": token,
                                    "password": "resetpasswordOK1111111111111111111111111111111111111111111",
                                }
                            )
                            .expect(200, {
                                success: false,
                                message: 'Password should not be more than 20 characters.'
                            })
                            .end((err, res) => {
                                if (err) {
                                    done(err);
                                } else {
                                    done();
                                }
                            })
                    })


            }).catch(err => done(err));


    })


});


describe('POST /forgot-password', () => {

    it('Should send user a reset password email ', (done) => {

        let username = 'forgotpasswordOne';
        let password = 'forgotpasswordOne';
        let email = 'forgotpasswordOne@gmai.com';
        db
            .signUp(username, password, email)
            .then(function (userId) {
                db.activateUser(userId)
                    // .then(ok => db.createToken(userId, 1, 3))
                    .then(ok => {
                        request(app)

                            .post('/api/forgot-password')
                            .set('Accept', 'application/json')
                            .send(
                                {
                                    "email": "forgotpasswordOne@gmai.com"
                                }
                            )
                            .expect(200, {
                                success: true,
                                message: 'Check your email.'
                            })
                            .end((err, res) => {
                                if (err) {
                                    done(err);
                                } else {
                                    done();
                                }
                            })
                    }).catch(err => done(err))


            }).catch(err => done(err));
    })

    it('Should reject un-verified user trying to reset password ', (done) => {

        let username = 'forgotpasswordTwo';
        let password = 'forgotpasswordTwo';
        let email = 'forgotpasswordTwo@gmai.com';
        db
            .signUp(username, password, email)
            .then(function (userId) {
                request(app)

                    .post('/api/forgot-password')
                    .set('Accept', 'application/json')
                    .send(
                        {
                            "email": "forgotpasswordTwo@gmai.com"
                        }
                    )
                    .expect(200, {
                        success: false,
                        message: 'Please verified your email address.'
                    })
                    .end((err, res) => {
                        if (err) {
                            done(err);
                        } else {
                            done();
                        }
                    })
            }).catch(err => done(err));
    })

    it('Should reject unknow email', (done) => {


        request(app)

            .post('/api/forgot-password')
            .set('Accept', 'application/json')
            .send(
                {
                    "email": "forgotpasswordThree@gmai.com"
                }
            )
            .expect(200, {
                success: false,
                message: 'Email not found.'
            })
            .end((err, res) => {
                if (err) {
                    done(err);
                } else {
                    done();
                }
            })

    })

});


describe('POST /forgot-username', () => {

    it('Should send username to user email ', (done) => {

        let username = 'forgotusernameOne';
        let password = 'forgotusernameOne';
        let email = 'forgotusernameOne@gmai.com';
        db
            .signUp(username, password, email)
            .then(function (userId) {
                db.activateUser(userId)
                    // .then(ok => db.createToken(userId, 1, 3))
                    .then(ok => {
                        request(app)

                            .post('/api/forgot-username')
                            .set('Accept', 'application/json')
                            .send(
                                {
                                    "email": "forgotusernameOne@gmai.com"
                                }
                            )
                            .expect(200, {
                                success: true,
                                message: 'Your username will be sent to your email.'
                            })
                            .end((err, res) => {
                                if (err) {
                                    done(err);
                                } else {
                                    done();
                                }
                            })
                    }).catch(err => done(err))


            }).catch(err => done(err));
    })


    it('Should reject incorrect email ', (done) => {

        request(app)

            .post('/api/forgot-username')
            .set('Accept', 'application/json')
            .send(
                {
                    "email": "forgotusernameTwo@gmai.com"
                }
            )
            .expect(200, {
                success: false,
                message: 'Email not found.'
            })
            .end((err, res) => {
                if (err) {
                    done(err);
                } else {
                    done();
                }
            })

    })

    it('Should reject un-verified email ', (done) => {

        let username = 'forgotusernameThree';
        let password = 'forgotusernameThree';
        let email = 'forgotusernameThree@gmai.com';
        db
            .signUp(username, password, email)
            .then(function (userId) {
                // db.activateUser(userId)
                // .then(ok => db.createToken(userId, 1, 3))
                // .then(ok => {
                request(app)

                    .post('/api/forgot-username')
                    .set('Accept', 'application/json')
                    .send(
                        {
                            "email": "forgotusernameThree@gmai.com"
                        }
                    )
                    .expect(200, {
                        success: false,
                        message: 'Please verified your email address.'
                    })
                    .end((err, res) => {
                        if (err) {
                            done(err);
                        } else {
                            done();
                        }
                    })
                // }).catch(err => done(err))


            }).catch(err => done(err));
    })



});
