import react, { Component } from 'react';
import { BrowserRouter as Router,Link } from 'react-router-dom';
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
        this.indexDir(this.state.index, result => {
            // console.log(result)
        });
    }

    async FileUpload() {
        this.setState({
            showFileUploader: true
        })
    }

    async indexDir(path, callback) {
        // console.log(path)
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
            alert("Error while Connecting Server", err);
            return;
        }
        // console.log(indexdirectory.msg);

        if(indexdirectory.status) {return console.log("err", indexdirectory.msg)}
        this.setState({
            filelist: indexdirectory.msg
        });
        callback(indexdirectory);
    }

    ChangeIndex(path) {
        this.setState({
            reloadDir: true,
            index: path
        });
        // console.log(this.state)
    }

    

    render() {
        // this.loadFilelist();
        return (
            <div className="Body">
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