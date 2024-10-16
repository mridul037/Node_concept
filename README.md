## WORKER IN NODE.JS

Imagine you are building a simple web server that handles requests to calculate the factorial of a number. 
We'll compare two approaches: one without Worker Threads (synchronous) and one using Worker Threads.

version runs the factorial calculation synchronously, which can block the server:

```
Run this server: node syncServer.js.
Open your browser and navigate to http://localhost:3000/?number=300000.
While waiting for the result, try navigating to another number quickly (like http://localhost:3000/?number=250000). You might notice delays, especially for larger numbers.
```

while Worker Threads. code hadles the delay
