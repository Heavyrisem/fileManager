const express = require('express');
const app = express();


app.post("/wh", (req, res) => {
    console.log(req.body);
});

app.listen(3002, () => {
    console.log("webhook server is open");
})