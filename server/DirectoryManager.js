const fs = require('fs');
const pt = require('path');
const checkdisk = require('check-disk-space');


// 파일 업로드 O
// 파일 삭제 X
// 파일 다운로드 X
// 폴더 생성 O
// 디렉토리 탐색 O
// 디스크 용량 가져오기 O
// 파일 검색 X
// 유저 홈 디렉토리 X

class DManager {
    
    init(path) {
        this.path = path
    }

    getFreeDiskSize(callback) {
        checkdisk(this.root_path).then(info => {
            callback(info);
        })
        .catch(err => {
            callback({err: err});
        });
    }

    removeFile(path, callback) {
        fs.unlink(path, (err) => {
            if (err) callback({err: err});
            else callback();
        })
    }


    getInsideDir(path, callback) {
        let dirlist = [];
        
        fs.readdir(path, {withFileTypes:true}, (err, files) => {
            
            if (err) return callback({err: err});
            if (files.length == 0) return callback(dirlist);
            files.forEach(file => {

                fs.stat(path+'/'+file.name, (err, stats) => {
                    
                    let datainfo = this.dataInfo(file.name);
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
        });
    }


    dataInfo(dataname) {
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



}


module.exports = new DManager();