const { parentPort, workerData } = require('worker_threads');

function factorial(n) {
    let result = BigInt(1);
    for (let i = 2; i <= n; i++) {
        result *= BigInt(i);
    }
    return result;
}

const result = factorial(workerData);
parentPort.postMessage(result);