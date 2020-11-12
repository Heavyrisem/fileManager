const express = require('express');
const multer  = require('multer');
const fs = require('fs');
const pt = require('path');
// const upload = multer({ dest: '../Data' })
const DATAPATH = "../DATA";
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            
            const path = DATAPATH+req.url.split('?')[0]
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
            const path = DATAPATH+req.url.split('?')[0];

            getInsideDir(path, res => {
                res.forEach(filelist => {
                    if (filelist.name+filelist.type == file.fieldname) return console.log("파일 중복됨"); // res.send(오류 발생 필요)
                });
                cb(null, file.fieldname);
                console.log(res);
            })
            return;

            fs.readdir(path, (err, list) => {
                if (list != null) {
                    cb(null, file.fieldname);
                }
                console.log('list', list)
                if (list.indexOf(file.fieldname)) { // 이미 파일이 존재할때
                    let max_num = 1;
                    getInsideDir(path)
                    // list.forEach(value => {
                        
                    //     getInsideDir(path, res => {
                    //         console.log(res);
                    //     })
                        // let replaced = value.match(/\(\d+\)/);


                        // if (replaced == null) return;
                        // else console.log(parseInt(replaced[0]))
                        // return
                        // console.log(replace(value.match(/\(\d+\)/)[0]));
                    // });

                }
                
                // cb(null, `${file.fieldname} - ${Date.now()}`);
            })
        }
    })
});
const app = express();

function replace(str, replaceStr) {
    return str.split(searchStr).join(replaceStr);
}

function getInsideDir(path, callback) {
    let dirlist = [];
    
    fs.readdir(path, (err, files) => {
        if (err) {console.log(err); callback({err: err})}
        if (files == null) return dirlist;
        files.forEach(file => {

            fs.stat(path+'/' + file, (err, stats) => {

                let datainfo = dataInfo(file);
                let info = {
                    name: datainfo.name,
                    type: datainfo.type,
                    hidden: datainfo.hidden,
                    path: path,
                    isFile: stats.isFile(),
                    size: stats.size,
                    c_time: stats.birthtime,
                    m_time: stats.mtime
                }

                dirlist.push(info);
                if (dirlist.length == files.length) callback(dirlist);
            });

        });
    })
}

function dataInfo(dataname) {
    let file_name;
    let file_type;
    let is_hidden = false;

    if (dataname.startsWith(".")) {
        is_hidden = true;
        dataname = dataname.replace(".", "");
    }
    if (pt.extname(dataname) != null) {
        file_type = pt.extname(dataname);
    }
    file_name = dataname.replace(file_type, "");

    return {name: file_name, type: file_type, hidden: is_hidden};
}

app.post("/*", upload.any(), (res, req) => {
    let list = []
    res.files.forEach(val => {
        list.push(val.fieldname)
    })
    req.send(list + " has recived");
});
app.put("/*", (res, req) => {
    const path = DATAPATH+res.url.split('?')[0];
    getInsideDir(path, res => {
        console.log('res', res)
    });
    // fs.mkdir(path, {recursive: true}, (err, path) => {
    //     if (err) return console.log(err);
    //     console.log('생성 완료 ', path);
    // })
    
})

app.listen(3001, () => {
    console.log('port opened 3001');
})