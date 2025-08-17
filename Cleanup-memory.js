// You're running a Node.js application in production that processes financial transactions. 
// After a few hours, memory usage keeps climbing and eventually the process crashes with "JavaScript heap out of memory."
const express = require('express');
const app = express();

// Global cache - suspicious!
const transactionCache = new Map();
const userSessions = {};

app.post('/api/process-transaction', async (req, res) => {
  const { userId, transactionData } = req.body;
  
  // Cache every transaction
  const transactionId = generateId();
  transactionCache.set(transactionId, {
    ...transactionData,
    timestamp: Date.now(),
    processed: false
  });
  
  // Store user session data
  if (!userSessions[userId]) {
    userSessions[userId] = [];
  }
  userSessions[userId].push({
    transactionId,
    sessionData: req.headers,
    largeBuffer: Buffer.alloc(1024 * 1024) // 1MB buffer per request!
  });
  
  // Process transaction...
  const result = await processTransaction(transactionData);
  
  transactionCache.set(transactionId, { ...transactionCache.get(transactionId), processed: true });
  
  res.json({ success: true, transactionId });
});

setInterval(() => {
  console.log('Memory usage:', process.memoryUsage());
}, 30000);
---------------------------------------------------------------------SOLUTION----------------------------------------------------------------
1 Map memory not freed up ✅
javascript// Problem: transactionCache grows forever
transactionCache.set(transactionId, data); // Never removed!

// Fix: TTL-based cleanup
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

setInterval(() => {
  const now = Date.now();
  for (const [id, transaction] of transactionCache) {
    if (now - transaction.timestamp > CACHE_TTL) {
      transactionCache.delete(id);
    }
  }
}, 5 * 60 * 1000); // Cleanup every 5 minutes


2. Buffer not freed ✅
javascript// Problem: 1MB buffer per user session, never cleared
largeBuffer: Buffer.alloc(1024 * 1024)

// Fix: Remove unnecessary buffers
userSessions[userId].push({
  transactionId,
  sessionData: req.headers, // Remove largeBuffer entirely
});

3. setInterval not cleared ✅
javascript// Problem: Interval keeps running even if not needed
// Fix: Clear intervals on app shutdown
const memoryInterval = setInterval(() => {
  console.log('Memory usage:', process.memoryUsage());
}, 30000);

process.on('SIGINT', () => {
  clearInterval(memoryInterval);
  process.exit(0);
});

--inspect flag + Chrome DevTools
clinic.js for production profiling
heapdump for memory snapshots
