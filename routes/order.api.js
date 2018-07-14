
/****
 * Creating a new order
 * Client post a new order 
 * this new order is then saved to database and an order id will be returned. 
 * user will then subscribe to socket io connection and
 * gets real time update on their order statuis. 
 * Shoper owner will also subscribe to the same channel
 * and send updates to clients of their latest update. 
 * To maintain security, only id will be sent over socket io channel,
 * the subscribers will make another api call to fetch the content from 
 * database or in-memory database. 
 */

module.exports = function (router, con, orderSocket) {

  var helper = require('../helper')(con);


  var db = require('../model/order.db')();

  router.get('/order/:id', function (req, res) {
    db.getMenu(req.params['id'])
      .then(obj => res.json({ success: true, message: obj }))
      .catch(err => res.json({ success: false, message: err }));



  })

  router.get('/order/test/:string', function (req, res) {
    orderSocket.sendMessageToChannel('chinahouse', req.params['string']);
    res.json({ success: true, message: req.params['string'] });
  })


  router.post('/order/myorders', function (req, res) {

    let token = req.body.token;

    // orderSocket.sendMessageToChannel(req.params.name, req.body.order);
    helper
      .isAllArgumentProvided(['token'], req.body)
      .then(ok => helper.isTokenSignedByServer(token))
      .then(response => {
        helper
          .isTokenValid(response.decoded, 2)
          .then(ok => db.getMyOrders(response.user['userId']))
          .then(orders => {
            res.json({ success: true, message: orders });
            // socket.createChannelById(id);
          })
          .catch(err => res.json({ success: false, message: err }));
      })

      .catch(err => res.json({ success: false, message: err }));

  })


  router.post('/order', function (req, res) {

    let token = req.body.token;
    let order = req.body.order;
    let shopId = req.body.shopId;
    let type = req.body.type;

    // orderSocket.sendMessageToChannel(req.params.name, req.body.order);
    helper
      .isAllArgumentProvided(['type', 'token', 'order', 'shopId'], req.body)
      .then(ok => helper.isTokenSignedByServer(token))
      .then(ok => helper.isEmailVerified(ok))
      .then(response => {
        helper
          .isTokenValid(response.decoded, 2)
          .then(ok => db.newOrder(shopId, response.user['userId'], order, type))
          .then(id => {
            res.json({ success: true, id: id, message: 'Order has been placed.' });
          })
          .catch(err => res.json({ success: false, message: err }));
      })

      .catch(err => res.json({ success: false, message: err }));

  })

}
// module.exports = router;
