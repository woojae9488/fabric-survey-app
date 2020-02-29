require('dotenv').config();

const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');

const apiResponse = require('./utils/apiResponse.js');
const network = require('./fabric/network.js');
const event = require('./fabric/event/event.js');
const router = require('./routes/index.js');

async function main() {
    await network.enrollAdmin(true);
    await network.enrollAdmin(false);

    event.handlingPastEvents();
    await event.activateContractEvent();
    // await event.activateBlockEvent();

    const app = express();
    app.use(morgan('combined'));
    app.use(bodyParser.json());
    app.use(cors());

    app.use('/', router);
    app.use((_req, res) => {
        return apiResponse.notFound(res);
    });

    app.listen(process.env.PORT);
}

main();
