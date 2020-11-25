import react, { Component } from 'react';
import unitchanger from 'unitchanger';
import { serverAddress } from './config.json';

class File extends Component {
    changeIDX() {
        if (this.props.info.isFile == false) {
            console.log(this.props.info.path);
            
            this.props.ChangeIndex(this.props.info.path.replace("../", "").replace("DATA", "").replace("//", ""));
            // console.log(this.props.parent.state)
        }
    }

    removeFile = async (e) => {
        e.stopPropagation();
        let response = await fetch(`http://${serverAddress}:3001/remove`, {
            method: "POST",
            body: JSON.stringify({path: this.props.info.path.replace("../", "").replace("DATA", "").replace("//", "")}),
            headers: {
                    'content-type': 'application/json'
            }
        });
        response = await response.json();
        if (response.status) {
            console.log("err", response.msg);
        } else {
            this.props.parent.setState({
                reloadDir: true
            })
        }
        console.log(response);
    }

    async downloadFile() {
        const downloadurl = `http://${serverAddress}:3001/download?path=/`+this.props.info.path.replace("../", "").replace("DATA", "").replace("//", "");
        window.open(downloadurl);
    }

    render() {
        return (
            <div onClick={this.changeIDX.bind(this)}>
                {this.props.info.name} {unitchanger.ByteCal(this.props.info.size)}
                <button onClick={this.removeFile}>Remove</button>
                {!this.props.info.isFile&& <button onClick={this.downloadFile.bind(this)}>Download</button>}
            </div>
        )
    }
}


export default File;