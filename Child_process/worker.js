// worker.js
process.on('message', (task) => {
    console.log(`Worker received task: ${task}`);

    // Simulating a heavy computation (e.g., calculating factorial)
    const result = factorial(task);
    
    // Send the result back to the parent process
    process.send({ task, result });
});

function factorial(n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}
