require('dotenv').config();

const express = require("express");
const cors = require('cors');
const cache = require('apicache').middleware;
const regions = require("./regions");

const app = express();
app.use(cors());
app.use('/', express.static(__dirname + '/public'))


app.get('/dates', async (req, res) => {
    const dates = await regions.getDates(req.query.address);
    res.send(dates);
});


app.use(cors());
// app.use(cache('5 minutes'));
app.listen(process.env.PORT, console.log("Server stared on port " + process.env.PORT));