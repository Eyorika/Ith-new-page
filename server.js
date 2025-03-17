require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const port = process.env.PORT || 3000;

 const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  
  max: 100  
});
 
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY 
);

 app.use(limiter);
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

 const validateFormData = (req, res, next) => {
  const { name, email, phone, message } = req.body;
  if (!name || !email || !phone || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  next();
};

 app.post('/submit-affiliate', validateFormData, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('affiliates')
      .insert([req.body]);

    if (error) throw error;
    
    res.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});