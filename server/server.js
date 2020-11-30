const express = require('express');
const multer  = require('multer');
const DATAPATH = "../DATA";
const cors = require('cors');
const DirM = require('./DirectoryManager');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();

const RandomToken = require('./RandomToken');
const SHA256 = require('./SHA256');
const sqlite3 = require('sqlite3').verbose();
const DB = new sqlite3.Database('./DB/server.db', sqlite3.OPEN_READWRITE, err => {
    if (err) {
        console.log(`Error while Opening DB ${err}`);
    } else {
        console.log(`Database Connected`);
    }
});

app.use(cors());
// DirM.init(DATAPATH);
// let Timer = Date.now();
// DirM.searchByName('test', DATAPATH).then(result => {
//     console.log(`검색 소요 시간 : ${Date.now() - Timer}ms, 일치하는 결과 ${result.res.length} 개 발견, ${result.counter}개의 데이터 탐색`)
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
                // console.log(req);
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

app.post("/size", (req, res) => {
    const path = DATAPATH+'/'+req.body.path;
    let Timer = Date.now();
    DirM.getDirSize(path, (err, size) => {
        if (err) res.send({status: 1, msg: err, executeTime: Date.now() - Timer});
        else res.send({status: 0, msg: size, executeTime: Date.now() - Timer});
    })
})

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

app.get("/download", (res, req) => {
    // res.url = res.url.replace("/download", "");
    const path = DATAPATH+res.query.path;
    console.log(`다운로드 요청: ${decodeURI(path)}`);
    // const path = DATAPATH+'/'+res.body.path;

    DirM.detailDataInfo(decodeURI(path), (err, info) => {
        if (err) return req.send({status: 1, msg: err});
        if (!info.isFile) {
            DirM.compressDir(path, (err, info) => {
                console.log('executeTime: ', info.executeTime, 'ms');
                return req.download(info.path);
            })
        } else {
            return req.download(path);
        }
    });
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

app.post("/mkdir", (req, res) => {
    const path = DATAPATH+'/'+req.body.path;

    DirM.mkdir(path, (err, path) => {
        if (err) return res.send({status: 1, msg: err});

        res.send({status: 0, msg: "DIR_CREATED", path: path});
    });    
});


app.post("/register", (req, res) => {
    const name = req.body.name;
    const passwd = SHA256(req.body.passwd);

    DB.all(`SELECT * FROM UserInfo WHERE name="${name}"`, (err, rows) => {
        if (err) return console.log(`ERROR GET ${err}`);

        if (rows.length != 0) {
            return res.send({status: 1, msg: "USER_EXISTS"});
        } else {
            const token = RandomToken(30);
            DB.run(`INSERT INTO UserInfo(name, passwd, token) VALUES("${name}", "${passwd}", "${token}")`, err => {
                if (err) {
                    return res.send({status: 1, msg: "DB_QUERY ERROR"});
                } else {
                    DirM.mkdir(`${DATAPATH}/home/${name}`, (err, path) => {
                        if (err) res.send({status: 1, msg: "Initialization_HOME_DIR"});
                        else DirM.mkdir(`${DATAPATH}/trash/${name}`, (err, path) => {
                            if (err) res.send({status: 1, msg: "Initialization_TRASH_DIR"});
                            else res.send({status: 0, msg: "SUCCESS", name: name, token: token});
                        });
                    });
                } 
            });
        }

    });
    
});

app.post("/login", (req, res) => {
    const name = req.body.name;
    const passwd = SHA256(req.body.passwd);

    DB.all(`SELECT * FROM UserInfo WHERE name="${name}"`, (err, rows) => {
        if (err) return console.log(`ERROR GET ${err}`);

        if (rows.length == 0) return res.send({status:1, msg: "NAME_WRONG"});

        let foundUserinfo;
        rows.forEach(info => {
            if (info.passwd == passwd) {
                foundUserinfo = info;
            }
        });

        if (foundUserinfo != null) return res.send({status: 0, name: foundUserinfo.name, token: foundUserinfo.token});
        else return res.send({status: 1, msg: "PASSWORD_WRONG"});
    });
})



app.listen(3001, () => {
    DirM.init(DATAPATH);
    console.log('port opened 3001');
});