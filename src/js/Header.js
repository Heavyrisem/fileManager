import React, { Component } from 'react';
import '../style/Header.css';
import MainIcon from '../icons/Main.svg';
import NoticeIcon from '../icons/Notice.svg';
import MenuIcon from '../icons/Menu.svg';
import UserDefault from '../icons/UserDefault.svg';

class Header extends Component {

  async keyinputHandler(e) {
    if (e.key == 'Enter') {
      let searchResult = await fetch("http://localhost:3001/search", {
        method: 'POST',
        body: JSON.stringify({keyword: e.target.value}),
        headers: {
                'content-type': 'application/json'
        }
      });
      searchResult = await searchResult.json();
      console.log(searchResult.msg, searchResult.executeTime+'ms')
      // searchResult.msg.forEach(value => {
      //   console.log(value)
      // })
    }
  }
  
  render() {
    return (
    <div className="Header">
      <div className="MainLogo">
        <div className="MainIcon">
          <img src={MainIcon}></img>
        </div>
        <div className="PageTitle">
          <span>클라우드</span>
        </div>
      </div>

      <div className="SearchBar">
        <input type="text" className="fab fa-sistrix" placeholder="  클라우드에서 검색" onKeyPress={this.keyinputHandler}></input>
      </div>
      <img className="Notice" src={NoticeIcon}></img>
      <img className="Menu" src={MenuIcon}></img>
      <div className="User">
        <div className="Profileimg">
          <img src={UserDefault}></img>
        </div>
        {/* <div className="Username">
          <span className="USN">USER<i className="fas fa-caret-down"></i></span>
          <div className="UserAction_dropdown">
            <a href="#">계정 설정</a>
            <a href="#">로그아웃</a>
          </div>
        </div> */}
      </div>
    </div>
    )
  }


}



export default Header;
