const fs = require('fs');
const pt = require('path')
const archiver = require('archiver');
const checkdisk = require('check-disk-space');
const getFolderSize = require('get-folder-size');


// 파일 업로드 O
// 파일 삭제 O
// 파일 다운로드 O 폴더는 불가능
// 폴더 생성 O
// 디렉토리 탐색 O
// 디스크 용량 가져오기 O
// 휴지통으로 이동 X


// 파일 검색 O
// 유저 홈 디렉토리 X

class DManager {
    
    init(path) {
        this.root_path = path;
    }

    getFreeDiskSize(callback) {
        checkdisk(__dirname).then(info => {
            // let outdata = {
            //     free: unitchanger.ByteCal(info.free),
            //     size: unitchanger.ByteCal(info.size),
            //     diskPath: info.diskPath
            // }
            callback(info);
        })
        .catch(err => {
            callback({err: err});
        });
    }

    getDirSize(dir, callback) {
        getFolderSize(dir, callback);
    }

    compressDir(path, callback) {
        try {
            const archive = archiver('tar', {
                zlib: {
                  level: 1
                }
            })
            const output = fs.createWriteStream(`${this.root_path}/temp/${Date.now()}.tar`);
            const Timer = Date.now();
            
            console.log("compressing")
            archive.on('error', function(err) {
                throw err;
            });
            output.on('end', function() {
              console.log('Data has been drained');
            });
            output.on('close', function() {
                console.log("end")
                return callback(undefined, {path: output.path, executeTime: Date.now()-Timer});
            });
            console.log(path)
            archive.directory(path, false);
            archive.finalize();
            archive.pipe(output);
        } catch(err) {
            callback(err, undefined);
        }
    }

    removeFile(path, callback) {
        this.detailDataInfo(path, (err, result) => {
            if (err) return callback({err: err});
            
            if (result.isFile) {
                fs.unlink(path, err => {
                    if (err != null) callback({err: err});
                    else callback({});
                });
            } else {
                fs.rmdir(path, {recursive: true}, err => {
                    if (err != null) callback({err: err});
                    else callback({});
                })
            }
        });
    }

    searchByName(name ,rootPath, deep) {
        return new Promise((resolve, reject) => {
            if (deep == undefined) deep = 0;
            let filecounter = 0;

            this.getInsideDir(rootPath, async list => {
                let found = [];
                
                await Promise.all(list.map(async (data, idx) => {
                    filecounter++;
                    if (data.name.indexOf(name) != -1) {
                        found.push(data);
                    }
                    if (!data.isFile) {
                        // console.log('Search ' + data.path);
                        let tmp = await this.searchByName(name, data.path, deep+1);
                        filecounter += tmp.counter;
                        found = found.concat(tmp.res);
                    }

                    // console.log(`${found.length} 개 결과 찾음, ${deep} 깊이 탐색`);
                }));

                resolve({res: found, counter: filecounter});
            });

        })
    }
    
    mkdir(path, callback) {
        
        this.getInsideDir(path, result => {
            if (result.err) {

                if (result.err.errno == -2 || -4058) { // create directory
                    fs.mkdir(path, {recursive: true}, (err, path) => {
                        if (err) return callback(err, undefined);
                        callback(undefined, path);
                    });
                } else {
                    callback(result.err, undefined);
                }

            } else {

                callback("DIR_OVERLAP", undefined);

            }
        });
    }

    getInsideDir(path, callback) {
        let dirlist = [];
        
        fs.readdir(path, {withFileTypes:true}, (err, files) => {
            
            if (err) return callback({err: err});
            if (files.length == 0) return callback(dirlist);
            files.forEach(file => {
                // console.log(path);
                this.detailDataInfo(path+'/'+file.name, (err, info) => {
                    if (err) return callback({err: err});
                    
                    dirlist.push(info);
                    if (dirlist.length == files.length) return callback(dirlist);
                });

            });
        });
    }

    detailDataInfo(path, callback) {
        fs.stat(path, (err, stats) => {
            if (err) return callback(err, undefined);
            
            let name = path.split('/');

            let info = {
                name: name[name.length-1],
                path: path,
                isFile: stats.isFile(),
                size: stats.size,
                c_time: stats.birthtime,
                m_time: stats.mtime
            }

            return callback(undefined, info);
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

    moveToRecycleBin(path) {
        let recycleBinPath = "\$Recycle.Bin\%SID%";
        fs.rename(path, recycleBinPath, function (err) {
            if (err) {
                if (err.code === 'EXDEV') {
                    copy();
                } else {
                    callback(err);
                }
                return;
            }
            callback();
        })  
    }

}


module.exports = new DManager();