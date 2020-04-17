require('dotenv').config();

const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');

const router = require('./routes/index.js');
const api = require('./utils/api.js');

function main() {
    const app = express();
    app.use(morgan('combined'));
    app.use(bodyParser.json({ limit: '10mb' }));
    app.use(cors());

    app.use('/v1', router);
    app.use((_req, res) => {
        return api.notFound(res);
    });

    app.listen(process.env.PORT);
}

main();
