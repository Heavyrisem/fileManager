import react, { Component } from 'react';
import '../../style/Alert.css';
import Warning from '../../icons/Warning.svg';
import Error from '../../icons/Error.svg';

class Alert extends Component {
    state = {
        showError: false,
        type: null,
        title: '',
        msg: '',
        img: null,
        timeout: null,
        tmp: 0
    }
    

    Notification(type, err, msg) {
        if (this.state.timeout != null) {
            document.getElementById("Alert").classList.remove("open");
            clearTimeout(this.state.timeout);
        //     this.setState({
        //         showError: true,
        //         type: type,
        //         title: err,
        //         msg: msg,
        //         timeout: null
        //     }, () => {
        //         this.Notification(type, err, msg);
        //     });
        }
        document.getElementById("Alert").classList.remove("open");
        this.state.tmp++;
        console.log(this.state.tmp)
        
        

        this.setState({
            showError: true,
            type: type,
            title: err,
            msg: msg,
            img: (type == "warning")? Warning : Error
        }, () => {
            document.getElementById("Alert").classList.add("open");
            this.state.timeout = setTimeout(() => {
                document.getElementById("Alert").classList.remove("open");
                // this.Notification();
            }, 5000);
        });


    }



    render() {
        return(
            <div className="Alert" id="Alert">
            {this.state.type&&
                <>
                    <img className="img" src={this.state.img} />
                    <div className="desc">
                        <div className="title">{this.state.title}</div>
                        <div className="msg">{this.state.msg}</div>
                    </div>
                </>
            }
            </div>
        )
    }
}


export default Alert;