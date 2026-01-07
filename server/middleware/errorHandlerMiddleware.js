const errorHandlerMiddleware = (error, req, res, next) => {
    const code = error.code !== undefined ? Number(error.code) : undefined;

    if (typeof code === 'number' && !isNaN(code) && code >= 100 && code <= 599 && error.message) {
        return res.status(code).json({ error: error.message });
    } else {
        console.log(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = errorHandlerMiddleware;