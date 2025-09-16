// server/index.js
const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get('/api/message', (req, res) => {
  res.json({ message: 'Hello from the server!' });
});


app.use(express.static(path.join(__dirname, '../client/build')));


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
