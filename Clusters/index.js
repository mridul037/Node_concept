const cluster = require('cluster');
const http = require('http');
const os = require('os');

const numCPUs = os.cpus().length; // Get the number of CPU cores

if (cluster.isMaster) {
    console.log(`Master process ${process.pid} is running`);

    // Fork workers for each CPU core
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
        // Optionally, you can fork a new worker here if needed
        cluster.fork();
    });
} else {
    // Workers can share the same HTTP server
    const server = http.createServer((req, res) => {
        res.writeHead(200);
        res.end(`Hello from worker ${process.pid}\n`);
    });

    server.listen(8000, () => {
        console.log(`Worker ${process.pid} started and listening on port 8000`);
    });
}
