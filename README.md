# Ice bear's Cave - NodeJS API! 

**NodeJS + MySql** is used to created this API Server for authentication user, register user and store user information. <br />
**Gmail API** is used to send email. <br />
**Unit Testing**  *supertest*,*expect* to test APIs. <br />
**Encryption** bcrypt , jsonwebtoken <br />

# Setup
Run `npm install` to install all dependencies and then run `nodemon` for local testing. Then go to `http://localhost:3000`.  <br />

# APIs
To access the APIs, user will need to perform a `/login` call and obtain an access token in order to gain access to the main APIs. <br />

A typical APIs call will return payload in the format of `{ success : boolean , message : string }` <br />
Some will return extra parameters. For instance,  **POST** `/login` will also  `emailVerified` to indicated whether this user is verified or not. <br />

**Sample Login calls:**  <br />

**POST** `/login` with payload `{ email: 'test@admin.com', password : '123456' }` <br />
**RESULT** `{success: true, message: [TOKEN_STRING], emailVerified: 0'}` <br /> <br />
**POST** `/login` with payload `{ email: 'test@admin.com', password : '00000' }` <br />
**RESULT** `{success: false, message: 'Incorrect password.'}` <br />

**Sample APIs calls for authenticated user:** <br />

**POST** `/myorders` with payload `{ token: [TOKEN_STRING], order : {}, shopdId: 0, type: 1 }` <br />
**RESULT** `{success: true, message: 'Order has been placed'}` <br />

Unverified user will be blocked  <br />
**POST** `/myorders` with payload `{ token: [TOKEN_STRING], order : {}, shopdId: 0, type: 1 }`  <br />
**RESULT** `{success: false, message: 'Please verify your email address first.'}` <br />
