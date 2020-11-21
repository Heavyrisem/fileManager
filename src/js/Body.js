import react, { Component } from 'react';
import '../style/Body.css';

import File from './File';
import FileUploader from './FileUploader';


class Body extends Component {
    
    state = {
        reloadDir: false,
        index: '/',
        filelist: '',
        showFileUploader: false
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
    }

    async getDiskInfo() {
        let serverDiskfree = await fetch("http://localhost:3001/diskinfo", {
          method: "POST",
          body: JSON.stringify({path: '/'}),
          headers: {
                  'content-type': 'application/json'
          }
        });
        serverDiskfree = await serverDiskfree.json();
        console.log(serverDiskfree);
    }

    async GoPreviousIndex() {
        if (this.state.prevIndex != '') {
            let tmp = this.state.index.split('/');
            tmp.pop();
            tmp = tmp.join("/");
            this.setState({
                reloadDir: true,
                index: tmp
            });
        } 
    }

    async loadFilelist() {
        this.indexDir(this.state.index);
    }

    async FileUpload() {
        this.setState({
            showFileUploader: true
        })
    }

    async indexDir(path, callback) {
        let indexdirectory;
        try {

            indexdirectory = await fetch("http://localhost:3001/index", {
                method: "POST",
                body: JSON.stringify({path: path}),
                headers: {
                        'content-type': 'application/json'
                }
            });
            indexdirectory = await indexdirectory.json();

        } catch (err) {
            const retrytime = 10000;
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
        this.setState({
            filelist: indexdirectory.msg
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

    

    render() {
        return (
            <div className="Body">
                <button onClick={this.props.Notification.bind(this,"error", "경고", "테스트용 경고 메세지")}>Errortest</button>
                {this.state.showFileUploader && <FileUploader parent={this} />}
                <div onClick={this.GoPreviousIndex.bind(this)}>{this.state.index}</div>
                {this.state.filelist ?
                    this.state.filelist.map((info, idx) => {
                        return <File key={idx} info={info} ChangeIndex={this.ChangeIndex.bind(this)} parent={this}></File>
                    }):
                    <div></div>
                }
                <button type="button" className="UploadButton" onClick={this.FileUpload.bind(this)}>Add File</button>
            </div>
        )
    }
}

export default Body;