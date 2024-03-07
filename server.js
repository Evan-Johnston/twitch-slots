const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files from a specified directory (e.g., public)
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Slot machine app listening at http://localhost:${port}`);
});