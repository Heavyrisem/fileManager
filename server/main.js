const express = require('express');
const app = express();
const fs = require('fs');
const PORT = 3001;
const DATAPATH = '../DATA';


const requestTime = (req, res, next) => {
    console.log(Date.now());
    next();
}
app.use(requestTime);

app.get('/*', (res, req) => {
    let paths = res.url.split('?')[0].split('/');

    fs.readdir(DATAPATH+paths.splice('?')[0], (filelist) => {
        if (filelist == null) return console.log('null')
        filelist.forEach(file => {
            console.log(file)
        })
    })
});



app.listen(PORT, () => {
    console.log(`Server is listning port ${PORT}`);
})