'use strict';

const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');

const apiResponse = require('./utils/apiResponse.js');
const network = require('./fabric/network.js');
const config = require('./fabric/config.js').connection;
const connectionType = config.connectionType;
const event = require('./fabric/event/event.js');
const router = require('./routes/index.js');

async function main() {
    await network.enrollAdmin(connectionType.MANAGER);
    await network.enrollAdmin(connectionType.STUDENT);

    event.handlingPastEvents();
    await event.activateContractEvent();
    // await event.activateBlockEvent();

    const app = express();
    app.use(morgan('combined'));
    app.use(bodyParser.json());
    app.use(cors());

    app.use('/', router);
    app.use((_req, res, _next) => {
        return apiResponse.notFound(res);
    });

    app.listen(process.env.PORT || 8090);
}

main();