const chalk = require('chalk');

let interval;
let loaderStartTime = null;

const startLoader = ({ message = 'Working', color = 'blue', wait = false }) => {
    loaderStartTime = wait ? Date.now() : null;
    let dots = '';
    interval = setInterval(() => {
        dots = dots.length < 3 ? dots + '.' : '';
        const styledMsg = chalk[color] ? chalk[color](message + dots) : message + dots;
        process.stdout.write(`\r${styledMsg}   `);
    }, 500);
};

const stopLoader = async ({ finalMessage = 'Done!', color = 'green' }) => {
    const MIN_DURATION = 2000;
    if (loaderStartTime) {
        const elapsed = Date.now() - loaderStartTime;
        const remaining = MIN_DURATION - elapsed;
        if (remaining > 0) {
            await new Promise(res => setTimeout(res, remaining));
        }
    }

    clearInterval(interval);
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);

    const styledMessage = chalk[color] ? chalk[color](finalMessage) : finalMessage;
    console.log(styledMessage);
};

module.exports = {
    startLoader,
    stopLoader
};
