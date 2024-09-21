const express = require('express');
const { Worker } = require('worker_threads');
const path = require('path');

const app = express();

// Function to offload the CPU-intensive task to a worker thread
function runImageProcessing() {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.resolve(__dirname, 'imageProcessingWorker.js'));

    worker.on('message', (message) => {
      resolve(message);
    });

    worker.on('error', (error) => {
      reject(error);
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
}

app.get('/image-process', async (req, res) => {
  try {
    // Offload the image processing task to a worker thread
    const result = await runImageProcessing();
    res.send(result);
  } catch (error) {
    res.status(500).send('Error processing image');
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
