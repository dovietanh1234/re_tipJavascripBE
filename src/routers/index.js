'use strict'

const express = require('express');
const { apiKey, checkPermissionForApiKey } = require('../auth/checkAuthen');
const router = express.Router();

//check apiKey:
router.use(apiKey);
//check permission(this key has permission to access our system BE):
router.use(checkPermissionForApiKey); // put the key '0000' in the parameter


// import routers:
router.use('/v1/api', require('./access/index'));

module.exports = router;