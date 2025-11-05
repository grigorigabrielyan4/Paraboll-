// server.js
// Simple Express server that serves the 'public/' directory
// and accepts feedback POSTs and stores them in 'feedbacks.json'.

import express from 'express';
import fs from 'fs';
import path from 'path';
import bodyParser from 'body-parser';

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC = path.join(process.cwd(), 'public');
const DATA_FILE = path.join(process.cwd(), 'feedbacks.json');

// ---------- Middleware ----------
app.use(bodyParser.json());
app.use(express.static(PUBLIC));

// ---------- Ensure feedback file exists ----------
function ensureDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]), 'utf8');
  }
}
ensureDataFile();

// ---------- Handle feedback POST ----------
app.post('/feedback', (req, res) => {
  try {
    const payload = req.body;
    if (!payload || !payload.message) {
      return res.status(400).json({ message: 'Invalid payload' });
    }

    // read existing feedbacks
    const all = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    all.push(payload);

    // save updated feedbacks
    fs.writeFileSync(DATA_FILE, JSON.stringify(all, null, 2), 'utf8');

    console.log('✅ New feedback saved:', payload);
    res.json({ message: 'Շնորհակալություն — կարծիքը ուղարկված է։' });
  } catch (err) {
    console.error('❌ Error saving feedback:', err);
    res.status(500).json({ message: 'Սխալ՝ պահպանման ընթացքում։' });
  }
});

// ---------- Start the server ----------
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
