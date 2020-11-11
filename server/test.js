const express = require('express');
const multer  = require('multer')
// const upload = multer({ dest: '../Data' })
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            console.log(req.url);
            // cb(null, false);
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