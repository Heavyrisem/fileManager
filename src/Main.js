import react, { Component } from 'react';

import Body from './js/Body';
import Header from './js/Header';

class Main extends Component {
    
    render() {
        return(
            <div className="Main">
                <Header />
                <Body />
            </div>
        )
    }

}

export default Main;