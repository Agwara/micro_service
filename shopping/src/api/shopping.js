const ShoppingService = require("../services/shopping-service");
// const { PublishCustomerEvent } = require("../utils");
const UserAuth = require('./middlewares/auth');
const {SubscribeMessage, PublishMessage} = require('../utils/index')
const { CUSTOMER_BINDING_KEY } = require('../config');
module.exports = (app, channel) => {
    
    const service = new ShoppingService();

    // Subscribe to the message broker
    SubscribeMessage(channel, service);

    app.post('/order',UserAuth, async (req,res,next) => {
        try {
            const { _id } = req.user;
            if (!_id) {
              return res.status(401).json({ message: "Unauthorized" });
            }
            const { txnNumber } = req.body;
            const { data } = await service.PlaceOrder({_id, txnNumber});

            const payload = await service.GetOrderPayload(_id, data, "CREATE_ORDER")

            // PublishCustomerEvent(payload)
            PublishMessage(channel, CUSTOMER_BINDING_KEY, JSON.stringify(payload))

            return res.status(200).json(data);
            
        } catch (err) {
            next(err)
        }

    });

    app.get('/orders',UserAuth, async (req,res,next) => {


        try {
            const { _id } = req.user;
            if (!_id) {
              return res.status(401).json({ message: "Unauthorized" });
            }
            const { data } = await service.GetOrders(_id)
            return res.status(200).json(data);
        } catch (err) {
            next(err);
        }

    });
       
    
    app.get('/cart', UserAuth, async (req,res,next) => {
        try {
            const { _id } = req.user;
            if (!_id) {
              return res.status(401).json({ message: "Unauthorized" });
            }
            const { data } = await service.getCart({_id})
            return res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    });
}