// Producer - adds jobs to queue
app.get('/api/process-data', async (req, res) => {
  const data = await fetchLargeDataset();
  
  // Add job to queue
  const job = await processingQueue.add('bulk-process', { 
    data,
    requestId: generateId() 
  });
  
  res.json({ jobId: job.id, status: 'queued' });
});

// Consumer - processes with concurrency
const processingQueue = new Bull('data-processing');

processingQueue.process('bulk-process', 10, async (job) => { // 10 concurrent workers
  const { data } = job.data;
  
  const results = [];
  for (let i = 0; i < data.length; i += 100) { // Your batch size idea
    const batch = data.slice(i, i + 100);
    const processed = batch.map(processRecord);
    results.push(...processed);
    
    // Update progress
    job.progress((i / data.length) * 100);
  }
  
  return results;
});
