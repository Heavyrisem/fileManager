import React, { Component } from 'react';

import Body from './js/Body';
import Header from './js/Header';
import Alert from './js/event/Alert';

class Main extends Component {

    state = {
        alert: ''
    }

    Notification(type, err, msg) {
        // console.log(this.state)
        this.state.alert.Notification(type,err,msg);
    }
    
    render() {
        return(
            <div className="Main">
                <Alert ref={instance => {this.state.alert = instance}}/>
                <Header />
                <Body Notification={this.Notification.bind(this)}/>
            </div>
        )
    }

}

export default Main;