const express = require('express');
const { PORT } = require('./config');
const { databaseConnection } = require('./database');
const expressApp = require('./express-app');
const {CreateChannel} = require('./utils/index');

const dotenv = require('dotenv')
dotenv.config({ path: "./config.env" });

const StartServer = async() => {

    const app = express();
    
    await databaseConnection();

    const channel = await CreateChannel();

    await expressApp(app, channel);

    app.listen(PORT, () => {
        console.log(`listening to port ${PORT}`);
    })
    .on('error', (err) => {
        console.log(err);
        process.exit();
    })
}

StartServer();