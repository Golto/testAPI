const express = require('express');
const app = express();
const port = 3000;

app.get('/time', (req, res) => {
  const currentTime = new Date().toTimeString();
  res.send(currentTime);
});

app.listen(port, () => {
  console.log(`L'API est en écoute sur le port ${port}`);
});
