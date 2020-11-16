import React, { Component } from 'react';
import './style/Header.css';
import MainIcon from './icons/Main.svg';
import NoticeIcon from './icons/Notice.svg';
import MenuIcon from './icons/Menu.svg';

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
        <div className="Username">
          <span className="USN">이승민<i className="fas fa-caret-down"></i></span>
          <div className="UserAction_dropdown">
            <a href="#">계정 설정</a>
            <a href="#">로그아웃</a>
          </div>
        </div>
      </div>
      <img className="Notice" src={NoticeIcon}></img>
      <img className="Menu" src={MenuIcon}></img>
    </div>
    )
  }


}



export default Header;
