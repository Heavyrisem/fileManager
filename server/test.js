const express = require('express');
const multer  = require('multer');
const DATAPATH = "../DATA";
const cors = require('cors');
const DirM = require('./DirectoryManager');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
app.use(cors());
// DirM.init(DATAPATH);
// let Timer = Date.now();
// DirM.searchByName('test', DATAPATH).then(result => {
//     console.log(`검색 소요 시간 : ${Date.now() - Timer}ms, 일치하는 결과 ${result.length} 개 발견`)
//     // console.log(result);
// })

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 


const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            req.url = req.url.replace("/upload", "");
            const path = DATAPATH+req.url.split('?')[0];
            // console.log(path);
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
            req.url = req.url.replace("/upload", "");
            const path = DATAPATH+req.url.split('?')[0];

            DirM.getInsideDir(path, req => {
                req.forEach(filelist => {
                    if (filelist.name+filelist.type == file.fieldname) return console.log("파일 중복됨"); // req.send(오류 발생 필요)
                });
                cb(null, file.originalname);
                console.log(req);
            });
        }
    })
});

function replace(str, replaceStr) {
    return str.split(searchStr).join(replaceStr);
}


app.post("/index", (req, res) => {
    // req.url = req.url.replace("/index", "");
    // const path = DATAPATH+req.url.split('?')[0];
    const path = DATAPATH+'/'+req.body.path;
    const Timer = Date.now();
    DirM.getInsideDir(path, result => {
        if (result.err) res.send({status:1, msg: result.err});
        else res.send({status: 0, msg: result, executeTime: Date.now() - Timer});
        // console.log(result);
    })
});

app.post("/search", (req, res) => {
    if (req.body.keyword == null) {
        res.send({status: 1, msg: "KEYWORD_NOT_RECIVED"});
    } else {
        let timestamp = Date.now();
        DirM.searchByName(req.body.keyword, DATAPATH).then(result => {
            res.send({status: 0, msg: result, executeTime: Date.now() - timestamp});
        });
    }
});

app.post("/remove", (res, req) => {
    // res.url = res.url.replace("/remove", "");
    // const path = DATAPATH+res.url.split('?')[0];
    const path = DATAPATH+'/'+res.body.path;


    DirM.removeFile(path, result => {
        if (result.err) return req.send({status: 1, msg: result.err, path: path});
        else return req.send({status: 0, msg: "REMOVED", path: path});
    })

})

app.post("/diskinfo", (res, req) => {
    DirM.getFreeDiskSize(info => {
       if (info.err) req.send({status: 1, msg: info.err});
       else return req.send(info);
    });
});

app.post("/download", (res, req) => {
    // res.url = res.url.replace("/download", "");
    // const path = DATAPATH+res.url.split('?')[0];
    const path = DATAPATH+'/'+req.body.path;

    DirM.detailDataInfo(path, (err, info) => {
        if (err) return req.send({status: 1, msg: err});
        else return req.download(path);
    })
})

app.post("/upload/*", upload.any(), (res, req) => {
    res.url = res.url.replace("/upload", "");
    
    let list = [];
    if (res.files == null) return req.send({status: 1, msg: "NO_FILE_RECIVED"});
    res.files.forEach(val => {
        list.push(val.fieldname);
    });
    req.send({status: 0, msg: "FILE_RECIVED"});
});

app.put("/mkdir", (res, req) => {
    // res.url.replace("/mkdir", "");
    // const path = DATAPATH+res.url.split('?')[0];
    const path = DATAPATH+'/'+req.body.path;
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