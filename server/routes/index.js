const express = require('express');
const router = express.Router();
const userRoute = require('./userRoute');
const questionRoute = require('./questionRoute');
const courseRoute = require('./courseRoute');
const deviceRequestRoute = require('./deviceRequestRoute');
const paymentRequestRoute = require('./paymentRequestRoute');

// Set up routes
router.use('/user', userRoute);
router.use('/question', questionRoute);
router.use('/course', courseRoute);
router.use('/device-request', deviceRequestRoute);
router.use('/payment-request', paymentRequestRoute);
module.exports = router;