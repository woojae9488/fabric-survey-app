'use strict';

const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const path = require('path');
const util = require('util');

const network = require('./fabric/network.js');
const config = require('./fabric/config.js').connection;
const connectionType = config.connectionType;

const event = require('./fabric/event/event.js');
event.handlingPastEvents();
event.activateContractEvent();
event.activateBlockEvent();

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('combined'));

app.post('/loginStudent', async (req, res) => {
    console.log('/loginStudent called!');
    let response = { err: '', res: '' };

    let paramId = req.body.id;
    let paramPw = req.body.password;

    let networkObj = await network.connect(connectionType.STUDENT, paramId);
    if (!networkObj) {
        response.err = 'network connect error'
        return res.json(response);
    }
    let ccResponse = await network.invoke(networkObj, 'qeuryStudent', paramId, paramPw);
    if (!ccResponse) {
        response.err = `fail to student login: ${paramId}`;
        return res.json(response);
    }

    response.res = ccResponse;
    return res.json(response);
});

app.post('/loginManager', async (req, res) => {
    console.log('/loginManager called!');
    let response = { err: '', res: '' };

    let paramId = req.body.id;
    let paramPw = req.body.password;

    let networkObj = await network.connect(connectionType.MANAGER, paramId);
    if (!networkObj) {
        response.err = 'network connect error'
        return res.json(response);
    }
    let ccResponse = await network.invoke(networkObj, 'qeuryManager', paramId, paramPw);
    if (!ccResponse) {
        response.err = `fail to manager login: ${paramId}`;
        return res.json(response);
    }

    response.res = ccResponse;
    return res.json(response);
});

app.listen(process.env.PORT || 8090);