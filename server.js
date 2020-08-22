"use strict";

const express = require('express');
const app = express();

app.use(express.static(__dirname + '/pub', {index: 'index.html'}));

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})