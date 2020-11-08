const express = require('express');
const app = express();
const fs = require('fs');
const PORT = 3001;

const requestTime = (req, res, next) => {
    req.requestTime = Date.now();
    next();
}
app.use(requestTime);

app.get('/*', (res, req) => {
    console.log(res.url)
})



app.listen(PORT, () => {
    console.log(`Server is listning port ${PORT}`);
})