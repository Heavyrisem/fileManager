import react, { Component } from 'react';
import '../style/FileUploader.css';


class FileUploader extends Component {
    async onFile(e) {
        console.log(e.target.files);
        let Keys = Object.keys(e.target.files);
        const fd = new FormData();
        Keys.forEach(key => {
            fd.append("myFile", e.target.files[key]);
        });
        
        let response = await fetch("http://localhost:3001/upload/"+this.props.parent.state.index, {
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

    render() {
        return (
            <div className="FileUploader">
                <input type="file" onChange={this.onFile.bind(this)} multiple></input>
            </div>
        )
    }
}

export default FileUploader;