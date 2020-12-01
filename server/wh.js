const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.get("/wh", (req, res) => {
    console.log("get", req.body);
    res.send("success");
});
app.post("/wh", (req, res) => {
    console.log("post", req.body);
    res.send("success");
});

app.listen(3001, () => {
    console.log("webhook server is open");
})