const express = require('express');
const app = express();


app.get("/wh", (req, res) => {
    console.log(req.body);
});
app.post("/wh", (req, res) => {
    console.log(req.body);
});

app.listen(3001, () => {
    console.log("webhook server is open");
})