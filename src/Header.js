import React, { Component } from 'react';
import './style/Header.css';
import MainIcon from './icons/Main.svg';

class Header extends Component {
  
  render() {
    return (
    <div className="Header">
      <div className="MainIcon">
        <img src={MainIcon}></img>
      </div>
      <div className="PageTitle">
        <span>드라이브</span>
      </div>

      <div className="SearchBar">
        <input type="text" className="fab fa-sistrix" placeholder="  클라우드에서 검색"></input>
      </div>
      <div className="User">
        <div className="Profileimg"></div>
        <div className="Username">이승민</div>
      </div>
      <div className="Notice"></div>
      <div className="Menu"></div>
    </div>
    )
  }


}



export default Header;
