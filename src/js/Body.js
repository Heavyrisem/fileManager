import react, { Component } from 'react';



import '../style/Body.css';

import SideBar from './SideBar';
import FileExplorer from './FileExplorer';



class Body extends Component {
    

    constructor(props) {
        super(props);
        console.log(this.props);
    }


    Notification(type, err, msg) {
        console.log(type,err,msg)
        this.props.Notification(type, err, msg);
    }

    render() {
        return (
            <div className="Body">
                <SideBar Notification={this.Notification.bind(this)} />
                <FileExplorer Notification={this.Notification.bind(this)} />
            </div>
        )
    }
}

export default Body;