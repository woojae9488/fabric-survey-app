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
// if admin is not exist =>
network.enrollAdmin(connectionType.STUDENT);
network.enrollAdmin(connectionType.MANAGER);

const event = require('./fabric/event/event.js');
event.handlingPastEvents();
event.activateContractEvent();
// event.activateBlockEvent();

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('combined'));

// routing

app.listen(process.env.PORT || 8090);