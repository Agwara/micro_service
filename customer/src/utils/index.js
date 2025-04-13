const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const amqp = require("amqplib");
const { APP_SECRET, MESSAGE_BROKER_URL, EXCHANGE_NAME, QUEUE_NAME, CUSTOMER_BINDING_KEY } = require("../config");

//Utility functions
module.exports.GenerateSalt = async () => {
  return await bcrypt.genSalt();
};

module.exports.GeneratePassword = async (password, salt) => {
  return await bcrypt.hash(password, salt);
};

module.exports.ValidatePassword = async (
  enteredPassword,
  savedPassword,
  salt
) => {
  return (await this.GeneratePassword(enteredPassword, salt)) === savedPassword;
};

module.exports.GenerateSignature = async (payload) => {
  try {
    return await jwt.sign(payload, APP_SECRET, { expiresIn: "30d" });
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports.ValidateSignature = async (req) => {
  try {
    const signature = req.get("Authorization");
    const payload = await jwt.verify(signature.split(" ")[1], APP_SECRET);
    req.user = payload;
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

module.exports.FormateData = (data) => {
  if (data) {
    return { data };
  } else {
    throw new Error("Data Not found!");
  }
};


/* ========== Message Broker ========== */

// Create a message broker connection
module.exports.CreateChannel = async () => {
  try {
    const connection = await amqp.connect(MESSAGE_BROKER_URL);
    const channel = await connection.createChannel();
    console.log("Connected to message broker", MESSAGE_BROKER_URL, "successfully");
    await channel.assertExchange(EXCHANGE_NAME, "direct", false);
    return channel;
  } catch (error) {
    console.error('RabbitMQ connection failed:', error);
    process.exit(1); // or retry logic here
  }
}

// Subscribe to a message
module.exports.SubscribeMessage = async (channel, service) => { 
  try {
    const appQueue = await channel.assertQueue(QUEUE_NAME);

    await channel.bindQueue(appQueue.queue, EXCHANGE_NAME, CUSTOMER_BINDING_KEY);

    await channel.consume(appQueue.queue, (data) => {
      console.log(`Message received from ${CUSTOMER_BINDING_KEY}`);
      console.log(data.content.toString());

      service.SubscribeEvents(data.content.toString()).then((response) => {
        console.log("Response from service", response);
      }).catch((error) => {
        console.log("Error in subscribing message", error);
      });
      
      // Acknowledge the message after processing it
      channel.ack(data);
    });
  } catch (error) {
    console.log("Error in subscribing message", error);
    throw error
  }
}
