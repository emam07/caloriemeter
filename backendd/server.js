const express = require('express');
const multer = require('multer');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Configure storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Handle file uploads and process the image
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const imagePath = path.join(__dirname, 'uploads', req.file.filename);
    
    // Run the Python script as a child process
    const pythonProcess = spawn('python', ['process_image.py', imagePath]);

    let scriptOutput = '';

    // Capture stdout from the Python script
    pythonProcess.stdout.on('data', (data) => {
      scriptOutput += data.toString();
    });

    // Handle script completion
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(scriptOutput);
          res.json(result);
        } catch (error) {
          console.error('Error parsing Python script output:', error);
          res.status(500).json({ error: 'An error occurred while processing the image.' });
        }
      } else {
        console.error(`Python script exited with code ${code}`);
        res.status(500).json({ error: 'An error occurred while processing the image.' });
      }
    });

    // Handle errors from the Python script
    pythonProcess.stderr.on('data', (data) => {
      console.error(`Error from Python script: ${data}`);
      res.status(500).json({ error: 'An error occurred while processing the image.' });
    });
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ error: 'An error occurred while processing the image.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
