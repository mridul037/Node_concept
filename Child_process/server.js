const http = require('http');
const { fork } = require('child_process');

const workers = [];

// Fork multiple worker processes
for (let i = 0; i < 4; i++) {
    const worker = fork('./worker.js');
    
    // Listen for messages from the worker
    worker.on('message', (message) => {
        console.log(`Received from worker: ${JSON.stringify(message)}`);
    });

    workers.push(worker);
}

// Create a simple HTTP server
const server = http.createServer((req, res) => {
    // Assuming the request URL contains a number (e.g., /factorial/5)
    const urlParts = req.url.split('/');
    const task = parseInt(urlParts[2]);

    if (!isNaN(task)) {
        // Send the task to one of the workers
        const worker = workers[task % workers.length]; // Simple load balancing
        worker.send(task);

        res.writeHead(202, { 'Content-Type': 'text/plain' });
        res.end(`Task received: ${task}. Worker will process it.`);
    } else {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Please provide a valid number.');
    }
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
