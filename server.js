const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Static files serving
app.use(express.static(path.join(__dirname, 'public')));

// API mock endpoints (optional - can be removed if using Vercel serverless)
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'LuxeStyle API is running' });
});

// Fallback to index.html for SPA routing
app.use((req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`LuxeStyle server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} to view the application`);
});
