require('dotenv').config();

const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');

const apiResponse = require('./utils/apiResponse.js');
const network = require('./fabric/network.js');
const router = require('./routes/index.js');

async function main() {
    await network.enrollAdmin();

    const app = express();
    app.use(morgan('combined'));
    app.use(bodyParser.json());
    app.use(cors(process.env.ADDR_API_GATEWAY));

    app.use('/', router);
    app.use((_req, res) => {
        return apiResponse.unauthorized(res);
    });

    app.listen(process.env.PORT);
}

main();
