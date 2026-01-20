const express = require('express');
const path = require('path');
const cookieParser = require("cookie-parser");
const cors = require('cors');
const morgan = require('morgan');
const chalk = require('chalk');
const helmet = require('helmet');
const compression = require("compression");
const allowedOrigins = require('./configs/allowedOrigins.config.json');
require('dotenv').config({ path: "./configs/.env" });
const connectDB = require("./configs/db.config");
const routes = require('./routes/index');
const apiRateLimiter = require('./middleware/rateLimiterMiddleware');
const trimMiddleware = require('./middleware/trimMiddleware');
const errorHandlerMiddleware = require('./middleware/errorHandlerMiddleware');
const logger = require('./utils/logger');

//Express Server Setup
const app = express();
const port = process.env.PORT || 5222;
const env = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const origins = allowedOrigins[env];
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || origins.includes(origin)) {
            callback(null, true);
        } else {
            console.log("CORS issue...");
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};
morgan.format('short', (tokens, req, res) => {
    const method = tokens.method(req, res);
    const url = tokens.url(req, res);
    const status = tokens.status(req, res);
    const responseTime = Math.round(tokens['response-time'](req, res)); // Remove decimals
    let colorStatus = status >= 400 ? chalk.red(status) : chalk.green(status);

    return `${chalk.blue(method)} ${chalk.yellow(url)} ${colorStatus} ${responseTime}ms`;
});

//Express Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(
    "/static",
    helmet.crossOriginResourcePolicy({ policy: "cross-origin" }),
    express.static(path.join(__dirname, "static"))
);
app.use(compression());
app.use(trimMiddleware);
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use(morgan('short'));


const DB = process.env.DB_URI;
connectDB(DB);

//Server status endpoint
app.get('/', (req, res) => {
    res.status(200).send('Course Management Server is up!');
});

// Routes
app.use("/api", apiRateLimiter);
app.use("/api", routes);

//Error Handler
app.use(errorHandlerMiddleware);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// Handle uncaught exceptions (e.g., synchronous code errors)
process.on('uncaughtException', (err) => {
    logger.error(`Uncaught Exception: ${err.message}`);
    logger.error(err.stack); // Log stack trace for debugging
    process.exit(1); // Exit the process with a non-zero status code (indicating failure)
});

// Handle unhandled promise rejections (e.g., promises that fail without .catch())
process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled Promise Rejection: ${err.message}`);
    logger.error(err.stack); // Log stack trace
    process.exit(1); // Exit the process with a non-zero status code
});

// Gracefully shut down the server when receiving a SIGTERM (e.g., when the process is terminated by a process manager)
process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Performing graceful shutdown...');
    app.close(() => {
        logger.info('Server closed.');
        process.exit(0); // Exit the process with a zero status code (indicating success)
    });
});

// Gracefully shut down the server when receiving a SIGINT (e.g., when you press Ctrl+C)
process.on('SIGINT', () => {
    logger.info('SIGINT received. Shutting down gracefully...');
    app.close(() => {
        logger.info('Server closed.');
        process.exit(0); // Exit the process with a zero status code
    });
});

app.listen(port, () => {
    console.log(`Node/Express Server is Up......\nPort: localhost:${port}`);
});