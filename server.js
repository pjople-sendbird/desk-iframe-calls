/**
 * Include Express as our NodeJS framework
 */
const express = require('express');
const app = express();

/**
 * Define any port you like
 */
const PORT = 9001;

/**
 * Define our public folder
 */
app.use(express.static('public'));

/**
 * Receive all requests for agents on: 
 * GET /agent
 */
app.get('/agent', (req, res) => {
    res.sendfile('./public/agent.html');
});

/**
 * Receive all requests for customers on:
 * GET /customer
 */
app.get('/customer', (req, res) => {
    res.sendfile('./public/customer.html');
});

/**
 * Start listening...
 */
app.listen(PORT);
console.log(`[SERVER RUNNING] 127.0.0.1:${PORT}`);
