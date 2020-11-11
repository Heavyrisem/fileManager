const express = require('express');
const app = express();




app.post("/upload", (res, req) => {
    console.log(res.body);
});

app.listen(3001, () => {
    console.log('port opened 3001');
})