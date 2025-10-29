const express = require('express');
const router = express.Router();
const userRoute = require('./userRoute');
const questionRoute = require('./questionRoute');
const courseRoute = require('./courseRoute');
const requestRoute = require('./requestRoute');
const paymentRoute = require('./paymentRoute');

// Set up routes
router.use('/user', userRoute);
router.use('/question', questionRoute);
router.use('/course', courseRoute);
router.use('/request', requestRoute);
router.use('/payment', paymentRoute);
module.exports = router;