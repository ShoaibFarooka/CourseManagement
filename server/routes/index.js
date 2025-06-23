const express = require('express');
const router = express.Router();
const userRoute = require('./userRoute');
const placeRoute = require('./placeRoute');
const quizRoute = require('./quizRoute');
const questionRoute = require('./questionRoute');

// Set up routes
router.use('/user', userRoute);
router.use('/place', placeRoute);
router.use('/quiz', quizRoute);
router.use('/question', questionRoute);

module.exports = router;