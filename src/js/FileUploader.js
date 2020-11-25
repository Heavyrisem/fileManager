import react, { Component } from 'react';
import '../style/FileUploader.css';
import { serverAddress } from './config.json';

class FileUploader extends Component {
    state = {
        hover: false
    }

    async onFile(e) {
        console.log(e.target.files);
        let Keys = Object.keys(e.target.files);
        const fd = new FormData();
        Keys.forEach(key => {
            fd.append("myFile", e.target.files[key]);
        });
        
        let response = await fetch(`http://${serverAddress}:3001/upload/`+this.props.parent.state.index, {
            method: "POST",
            body: fd
        });
        response = await response.json();
        if (response.status) {
            console.log("업로드 오류", response.msg);
        } else {
            this.props.parent.setState({
                showFileUploader: false,
                reloadDir: true
            });
        }
    }

    async uploadFile(files) {
        
    }

    Close() {
        this.props.parent.setState({
            showFileUploader: false
        });
    }

    FileDrop = (e) => {
        this.setState({
            hover: false
        })
        e.stopPropagation();
        e.preventDefault();
        if (e.dataTransfer.items) {
            for (let i = 0; i < e.dataTransfer.items.length; i++) {
                let data = e.dataTransfer.items[i];
                if (data.kind != 'file') {
                    this.props.Notification("warning", "경고", "파일만 업로드 가능합니다.");
                    return;
                }

                console.log(e.dataTransfer.items[i].getAsFile());
            }
            // console.log(e.dataTransfer.items)
            // e.dataTransfer.items.forEach((data, idx) => {
            //     console.log(data)
            // });
        } else {

        }
    }

    FileDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.state.hover) return;
        this.setState({
            hover: true
        });
        this.state.hover = true;
        // document.getElementById("FileUploader").classList.add("hover");

    }

    FileDragLeave = (e) => {
        e.stopPropagation();
        this.setState({
            hover: false
        });
        // document.getElementById("FileUploader").classList.remove("hover");
    }

    render() {
        return (
            <div id="FileUploader" className="FileUploader" onDrop={this.FileDrop} onDragOver={this.FileDrag} >

                {(this.state.hover)?
                        <div className="dragBox" onDrop={this.FileDrop} onDragOver={this.FileDrag} onDragLeave={this.FileDragLeave}>
                            <span>업로드할 파일을 여기에 놓아주세요</span>
                        </div>
                        // <></>
                    :
                    <>
                        <input type="file" onChange={this.onFile.bind(this)} multiple></input>
                        <button type="button" onClick={this.Close.bind(this)}>닫기</button>
                    </>
                }

            </div>
        )
    }
}

export default FileUploader;