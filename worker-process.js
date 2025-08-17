The synchronous processRecord() function is blocking the event loop for 50,000 iterations, preventing Node.js from handling other requests.
app.get('/api/process-data', async (req, res) => {
  const data = await fetchLargeDataset(); // Returns 50,000 records
  
  const results = [];
  for (let i = 0; i < data.length; i++) {
    const processed = processRecord(data[i]); // CPU-intensive sync operation
    results.push(processed);
  }
  
  res.json({ results, count: results.length });
});

function processRecord(record) {
  // Simulate heavy CPU work - calculating hash, transformations, etc.
  let hash = 0;
  for (let i = 0; i < 100000; i++) {
    hash += Math.random() * record.id;
  }
  return { ...record, hash };
}
-------------------------------SOLUTIONS-________________----------------------------------------------
  
const { Worker, isMainThread, parentPort } = require('worker_threads');

// Main thread
app.get('/api/process-data', async (req, res) => {
  const data = await fetchLargeDataset();
  
  const worker = new Worker(__filename);
  worker.postMessage(data);
  
  worker.on('message', (results) => {
    res.json({ results, count: results.length });
  });
});

// Worker thread
if (!isMainThread) {
  parentPort.on('message', (data) => {
    const results = data.map(processRecord); // CPU work in separate thread
    parentPort.postMessage(results);
  });
}
