import react, { Component } from 'react';
import '../../style/ContextMenu.css';

class ContextMenu extends Component {


    render() {
        return(
            <div className="ContextMenuRoot" style={{top: this.props.pos.Y+"px", left: this.props.pos.X+"px"}}>

                {
                    this.props.menus.map((value, idx) => {
                        return <div key={idx} className="ContextMenu" onClick={value.handler}>{value.name}</div>
                    })
                }
                    
            </div>
        )
    }
}

export default ContextMenu;