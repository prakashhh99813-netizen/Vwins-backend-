const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.get('/', (req, res) => {
  res.send('Vwins Backend Engine is Running Live!');
});

app.post('/api/get-scanner', async (req, res) => {
  const { amount } = req.body;
  try {
    const activeScanners = await pool.query('SELECT upi_id, merchant_name FROM merchant_scanners WHERE is_active = true');
    if (activeScanners.rows.length === 0) {
      return res.status(400).json({ error: 'No active scanners' });
    }
    const selected = activeScanners.rows[Math.floor(Math.random() * activeScanners.rows.length)];
    const txnRef = 'VWINS' + Date.now();
    const upiPayload = `upi://pay?pa=${selected.upi_id}&pn=${encodeURIComponent(selected.merchant_name)}&am=${amount}&tr=${txnRef}&cu=INR`;

    res.json({
      success: true,
      txn_ref: txnRef,
      upi_id: selected.upi_id,
      upi_qr_payload: upiPayload
    });
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server live on port ${PORT}`));
