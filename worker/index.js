const http = require('http');
const { Worker } = require('worker_threads');

function runWorker(workerData) {
    return new Promise((resolve, reject) => {
        const worker = new Worker('./worker.js', { workerData });

        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(`Worker stopped with exit code ${code}`));
            }
        });
    });
}

const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const number = parseInt(url.searchParams.get('number'));

    if (isNaN(number) || number < 0) {
        res.writeHead(400);
        res.end('Invalid number');
        return;
    }

    runWorker(number)
        .then(result => {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(`Factorial of ${number} is ${result}`);
        })
        .catch(err => {
            res.writeHead(500);
            res.end('Error calculating factorial');
        });
});

server.listen(3000, () => {
    console.log('Server running at http://localhost:3000/');
});
