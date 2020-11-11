const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const PORT = 3001;
const DATAPATH = "../DATA";

const requestTime = (req, res, next) => {
    console.log(Date.now());
    next();
}
app.use(requestTime);

app.get('/*', (res, req) => {
    let pt = res.url.split('?');
    

    fs.readdir(DATAPATH + pt[0], (err, filename_list) => {
        filelist = [];
        if (err) {
            req.status(404).send({err: err.errno, path: err.path});
            console.log (err);
            return
        }
        if (filename_list == null) return req.send(null);
        filename_list.forEach(file => {
           
            filelist.push(dataInfo(file));
            
        });


        req.send(filelist);
    });


});

function dataInfo(dataname) {
    let file_name;
    let file_type;
    let is_hidden = false;

    if (dataname.startsWith(".")) {
        is_hidden = true;
        dataname = dataname.replace(".", "");
    }
    if (path.extname(dataname) != null) {
        file_type = path.extname(dataname);
    }
    file_name = dataname.replace(file_type, "");

    return {name: file_name, type: file_type, hidden: is_hidden};
}

app.listen(PORT, () => {
    console.log(`Server is listning port ${PORT}`);
})