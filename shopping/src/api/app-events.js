const ShoppingService = require("../services/shopping-service");

module.exports = (app) => {
  const service = new ShoppingService();

  app.use("/app-events", async (req, res, next) => {
    try {
      const { payload } = req.body;
      service.SubscribeEvents(payload)

      console.log("========== Shopping Service Received Event ==========")
      return res.status(200).json(payload);
    } catch (err) {
      next(err);
    }
  });

};