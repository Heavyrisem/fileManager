import react, { Component } from 'react';
import ContextMenu from './event/ContextMenu';

import { ByteCal } from 'unitchanger';
import { serverAddress } from './config.json';


import '../style/Body.css';

import File from './File';
import FileUploader from './FileUploader';
import Disk from '../icons/Disk.svg';

function fetchWithtimeout (url, options, timeout = 7000) {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), timeout)
        )
    ]);
}


class Body extends Component {
    
    state = {
        reloadDir: false,
        index: '/',
        filelist: '',
        showFileUploader: false,
        FreeDiskSpace: 1,
        DiskSize: 1,
        showContext: false
    }

    constructor(props) {
        super(props);
        console.log(this.props);
    }

    componentDidUpdate() {
        if (this.state.reloadDir) {
            this.state.reloadDir = false;
            this.loadFilelist();
        }
    }
    componentDidMount() {
        this.loadFilelist();
        this.getDiskInfo();
    }

    async getDiskInfo() {
        let serverDiskfree;
        try {
            serverDiskfree = await fetchWithtimeout(`http://${serverAddress}:3001/diskinfo`, {
              method: "POST",
              body: JSON.stringify({path: '/'}),
              headers: {
                      'content-type': 'application/json'
              }
            }, 3000);
            serverDiskfree = await serverDiskfree.json();

        } catch(err) {
            this.Notification("error", "서버 통신 오류", "서버 스토리지의 용량을 가져오는데 실패했습니다.");
            return;
        }

        if (serverDiskfree.status) {
            this.Notification("error", "서버 통신 오류", "서버 스토리지의 용량을 가져오는데 실패했습니다.");
        }
        this.setState({
            FreeDiskSpace: serverDiskfree.free,
            DiskSize: serverDiskfree.size
        }, () => {
            console.log("disk", this.state.DiskSize/this.state.FreeDiskSpace);
        })
        // console.log(ByteCal(serverDiskfree.free), ByteCal(serverDiskfree.size));
    }

    async GoPreviousIndex() {
        if (this.state.prevIndex != '') {
            let tmp = this.state.index.split('/');
            tmp.pop();
            tmp = tmp.join("/");
            this.setState({
                reloadDir: true,
                index: (tmp == "")? "/" : tmp
            });
        } 
    }

    async loadFilelist() {
        this.indexDir(this.state.index);
    }

    async FileUpload() {
        this.setState({
            showFileUploader: true,
            showContext: false
        })
    }

    async indexDir(path, callback) {
        let indexdirectory;
        try {

            indexdirectory = await fetch(`http://${serverAddress}:3001/index`, {
                method: "POST",
                body: JSON.stringify({path: path}),
                headers: {
                        'content-type': 'application/json'
                }
            });
            indexdirectory = await indexdirectory.json();

        } catch (err) {
            const retrytime = 3000;
            this.Notification("error", "서버 통신 오류", `서버와 연결중 오류가 발생했습니다. ${retrytime/1000}초후 다시 연결을 시도합니다.`);
            setTimeout(() => {
                this.indexDir(this.state.index, () => {
                    this.Notification("warning", "서버 온라인", "서버와 연결을 성공했습니다.");
                });
            }, retrytime)
            return;
        }

        if(indexdirectory.status) {
            this.Notification("error", "디렉터리 로드 오류", `오류 코드: ${indexdirectory.msg.errno}`);
            return console.log("err", indexdirectory.msg);
        }
        if(indexdirectory.executeTime > 1000) {
            this.Notification("warning", "연결 상태 불안정", `디렉터리 탐색 속도가 느립니다. 인터넷 연결을 확인하거나 디렉터리를 정리해 주세요`);
        }
        console.log("indexTime:", indexdirectory.executeTime);
        this.setState({
            filelist: indexdirectory.msg.sort((a,b) => {
                return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
            })
        });
        if (callback) callback(indexdirectory);
    }

    ChangeIndex(path) {
        this.setState({
            reloadDir: true,
            index: path
        });
    }


    Notification(type, err, msg) {
        console.log(type,err,msg)
        this.props.Notification(type, err, msg);
    }

    showContext = (e) => {
        console.log(e.pageX, e.pageY);
        e.preventDefault();
        this.setState({
            showContext: true,
            showFileUploader: false,
            ContextPos: {X: e.pageX, Y: e.pageY}
        });
    }

    hideContext() {
        console.log("hide")
        this.setState({
            showContext: false,
            // showFileUploader: false,
        });
    }

    test() {
        console.log("EVENT");
    }

    render() {
        const ContextList = [
            {
                name: "파일 업로드",
                handler: this.FileUpload.bind(this)
            },
            {
                name: "디렉터리 생성",
                handler: this.test.bind(this)
            }
        ]
        return (
            <div className="Body">
                <div className="LeftBar">
                    <div className="DiskSpace">
                        <img src={Disk} />
                        <span className="DiskName">저장 공간</span>
                        <div className="DiskFree">{ByteCal(this.state.DiskSize)+" / "+ByteCal(this.state.FreeDiskSpace)}</div>
                        <div className="Diskprogress">
                            <div style={{width: 100-this.state.FreeDiskSpace*100/this.state.DiskSize+"%"}}></div>
                        </div>
                    </div>
                </div>
                
                {this.state.showContext&& <ContextMenu pos={this.state.ContextPos} menus={ContextList}></ContextMenu>}
                    <div className="FileExplorer" onClick={this.hideContext.bind(this)} onContextMenu={this.showContext}>
                        {this.state.showFileUploader && <FileUploader parent={this} Notification={this.Notification.bind(this)}/>}
                        <div onClick={this.GoPreviousIndex.bind(this)}>현재 디렉터리 {this.state.index}
                            <button style={{float: "right"}} type="button" className="UploadButton" onClick={this.FileUpload.bind(this)}>Add File</button>
                        </div>
                        {this.state.filelist ?
                            this.state.filelist.map((info, idx) => {
                                return <File key={idx} info={info} ChangeIndex={this.ChangeIndex.bind(this)} parent={this}></File>
                            }):
                            <div></div>
                        }

                    </div>
            </div>
        )
    }
}

export default Body;