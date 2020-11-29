import react, { Component } from 'react';
import ContextMenu from './event/ContextMenu';
import { serverAddress } from './config.json';

import '../style/FileExplorer.css';

import File from './File';
import FileUploader from './FileUploader';

import PathFinderArrow from '../icons/PathFinderArrow.svg';

class FileExplorer extends Component {

    
    state = {
        reloadDir: false,
        index: '',
        filelist: '',
        showFileUploader: false,
        showContext: false
    }

    constructor(props) {
        super(props);
        this.Notification = this.props.Notification;
    }
    
    componentDidUpdate() {
        if (this.state.reloadDir) {
            this.state.reloadDir = false;
            this.loadFilelist();
        }
    }
    componentDidMount() {
        this.loadFilelist();
    }

    async GoPreviousIndex() {
        if (this.state.prevIndex != '') {
            let tmp = this.state.index.split('/');
            tmp.pop();
            tmp = tmp.join("/");
            this.setState({
                reloadDir: true,
                index: (tmp == "")? "" : tmp
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
        // console.log("indexTime:", indexdirectory.executeTime);
        this.setState({
            filelist: indexdirectory.msg.sort((a,b) => {
                return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
            })
        });
        if (callback) callback(indexdirectory);
    }

    ChangeIndex(path) {
        // console.log(path);
        this.state.reloadDir = true;
        this.setState({
            reloadDir: true,
            index: path
        });
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
        // console.log("hide")
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

        return(
            <>
            {this.state.showContext&& <ContextMenu pos={this.state.ContextPos} menus={ContextList}></ContextMenu>}

            <div className="FileExplorer" onClick={this.hideContext.bind(this)} onContextMenu={this.showContext}>
                {this.state.showFileUploader && <FileUploader parent={this} Notification={this.Notification.bind(this)}/>}
                <div className="PathFinder">
                    <span onClick={this.ChangeIndex.bind(this, "/")}>내 클라우드</span>
                    {
                        this.state.index.split("/").map((index, key) => {
                        if (index == '') return;
                        console.log(this.state.index.split("/").splice(0, key+1).join("/"), index, key);
                        return (<><img src={PathFinderArrow} /><span className={key} key={key} onClick={this.ChangeIndex.bind(this, this.state.index.split("/").splice(0, key+1).join("/"))}>{index}</span></>);
                    })
                    }
                    <button style={{float: "right"}} type="button" className="UploadButton" onClick={this.FileUpload.bind(this)}>Add File</button>
                </div>
                {this.state.filelist ?
                    this.state.filelist.map((info, idx) => {
                        return <File key={idx} info={info} ChangeIndex={this.ChangeIndex.bind(this)} parent={this}></File>
                    }):
                    <div></div>
                }

            </div>
            </>
        )
    }
}


export default FileExplorer;