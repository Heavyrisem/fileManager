const express = require('express');
const multer  = require('multer');
const fs = require('fs');
// const upload = multer({ dest: '../Data' })
const DATAPATH = "../DATA"
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const path = DATAPATH+req.url.split('?')[0]
            console.log(path);
            if (!fs.existsSync(path)) {
                console.log('make');
                fs.mkdir(path, {recursive: true}, (err) => {
                    cb(null, path);
                })
            }
        }
    })
});
const app = express();
var i = 0



app.post("/*", upload.single('file'), (res, req) => {
    i++;
    console.log(res.file, i);
    req.send(res.file.fieldname + "has recived");
});

app.listen(3001, () => {
    console.log('port opened 3001');
})