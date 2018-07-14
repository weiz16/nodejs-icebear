# Ice bear's Cave - NodeJS API!

**NodeJS + MySql** is used to created this API Server for authentication user, register user and store user information. 
**Gmail API** is used to send email.
**Unit Testing**  *supertest*,*expect* to test APIs.
**Encryption** bcrypt , jsonwebtoken

# Setup
Run `npm install` to install all dependencies and then run `nodemon` for local testing. Then go to `http://localhost:3000`. 

This server is also running live at [https://protected-wildwood-23463.herokuapp.com/api/](https://protected-wildwood-23463.herokuapp.com/api/)

Front-end web application relying on this server is deployed at [https:www.lemonhouse.tk](https://www.lemonhouse.tk)

Testing account email : `test@admin.com` 

Testing account password: `123456`

**Note** : Some configuration is not upload here for security issues. 

# APIs
To access the APIs, user will need to perform a `/login` call and obtain an access token in order to gain access to the main APIs. 

A typical APIs call will return payload in the format of `{ success : boolean , message : string }`
Some will return extra parameters. For instance,  **POST** `/login` will also  `emailVerified` to indicated whether this user is verified or not. 

**Sample Login calls:** 

**POST** `/login` with payload `{ email: 'test@admin.com', password : '123456' }` 

**RESULT** `{success: true, message: [TOKEN_STRING], emailVerified: 0'}`

**POST** `/login` with payload `{ email: 'test@admin.com', password : '00000' }` 

**RESULT** `{success: false, message: 'Incorrect password.'}`

**Sample APIs calls for authenticated user:** 

**POST** `/myorders` with payload `{ token: [TOKEN_STRING], order : {}, shopdId: 0, type: 1 }` 

**RESULT** `{success: true, message: 'Order has been placed'}`

Unverified user will be blocked 
**POST** `/myorders` with payload `{ token: [TOKEN_STRING], order : {}, shopdId: 0, type: 1 }` 

**RESULT** `{success: false, message: 'Please verify your email address first.'}`
