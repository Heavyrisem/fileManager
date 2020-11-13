const express = require('express');
const multer  = require('multer');
const DATAPATH = "../DATA";
const DirM = require('./DirectoryManager');


const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            res.url = res.url.replace("/upload", "");
            const path = DATAPATH+req.url.split('?')[0];
            console.log(path);
            if (!fs.existsSync(path)) {
                console.log(path + " is not found Creating New Directory");
                fs.mkdir(path, {recursive: true}, (err) => {
                    if (err) return console.log(err);
                    cb(null, path);
                });
            } else {
                cb(null, path);
            }
        },
        filename: (req, file, cb) => {
            res.url = res.url.replace("/upload", "");
            const path = DATAPATH+req.url.split('?')[0];

            getInsideDir(path, res => {
                res.forEach(filelist => {
                    if (filelist.name+filelist.type == file.fieldname) return console.log("파일 중복됨"); // res.send(오류 발생 필요)
                });
                cb(null, file.fieldname);
                console.log(res);
            });
        }
    })
});
const app = express();

function replace(str, replaceStr) {
    return str.split(searchStr).join(replaceStr);
}


app.post("/index/*", (res, req) => {
    res.url = res.url.replace("/index", "");
    const path = DATAPATH+res.url.split('?')[0];

    DirM.getInsideDir(path, result => {
        if (result.err) req.send({status:1, msg: result.err});
        else req.send({status: 0, msg: result});
        // console.log(result);
    })
});



app.put("/upload/*", upload.any(), (res, req) => {
    res.url = res.url.replace("/upload", "");
    
    let list = [];
    res.files.forEach(val => {
        list.push(val.fieldname);
    });
    req.send(list + " has recived");
});

app.put("/mkdir/*", (res, req) => {
    res.url.replace("/mkdir", "");
    const path = DATAPATH+res.url.split('?')[0];
    getInsideDir(path, result => {
        
        if (result.err) {

            if (result.err.errno == -2) { // create directory
                fs.mkdir(path, {recursive: true}, (err, path) => {
                    if (err) req.send({status: 0, msg: err, path: path});
                    req.send({status: 1, msg: "디렉터리가 생성되었습니다.", path: path});
                });
            } else {
                req.send({status: 1, msg: err, path: path});
            }

        } else {

            req.send({status: 1, msg: "DIR_OVERLAP", path: path});

        }
    });
    
});

app.listen(3001, () => {
    DirM.init(DATAPATH);
    console.log('port opened 3001');
});