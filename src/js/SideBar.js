import react, { Component } from 'react';
import { serverAddress } from './config.json';
import { ByteCal } from 'unitchanger';
import '../style/SideBar.css';

import AddData from '../icons/AddData.svg';
import MyCloud from '../icons/MyCloud.svg';
import ShareCloud from '../icons/ShareCloud.svg';
import RecentCloud from '../icons/RecentCloud.svg';
import ImportantCloud from '../icons/ImportantCloud.svg';
import TrashCloud from '../icons/TrashCloud.svg';
import Disk from '../icons/Disk.svg';

function fetchWithtimeout (url, options, timeout = 7000) {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), timeout)
        )
    ]);
}

class SideBar extends Component {
    state = {
        FreeDiskSpace: 1,
        DiskSize: 1,
    }
    constructor(props) {
        super(props);
        this.Notification = this.props.Notification;
        this.getDiskInfo();
    }

    async getDiskInfo() {
        let serverDiskfree;
        try {
            serverDiskfree = await fetchWithtimeout(`http://${serverAddress}:3001/diskinfo`, {
              method: "POST",
              body: JSON.stringify({path: '/'}),
              headers: {
                      'content-type': 'application/json'
              }
            }, 3000);
            serverDiskfree = await serverDiskfree.json();

        } catch(err) {
            this.Notification("error", "서버 통신 오류", "서버 스토리지의 용량을 가져오는데 실패했습니다.");
            return;
        }

        if (serverDiskfree.status) {
            this.Notification("error", "서버 통신 오류", "서버 스토리지의 용량을 가져오는데 실패했습니다.");
        }
        this.setState({
            FreeDiskSpace: serverDiskfree.free,
            DiskSize: serverDiskfree.size
        }, () => {
            console.log("disk", this.state.DiskSize/this.state.FreeDiskSpace);
        })
        // console.log(ByteCal(serverDiskfree.free), ByteCal(serverDiskfree.size));
    }

    render() {
        return(
            <div className="SideBar">
                <div className="AddData">
                    <div>
                        <img className="Addimg" src={AddData}></img>
                        <span>새로 만들기</span>
                    </div>
                </div>
                <div className="SideBarList">
                    <div className="MyCloud List">
                        <img className="MyCloudimg" src={MyCloud}></img>
                        <span>내 클라우드</span>
                    </div>
                    <div className="ShareCloud List">
                        <img className="ShareCloudimg" src={ShareCloud}></img>
                        <span>공유 문서함</span>
                    </div>
                    <div className="RecentCloud List">
                        <img className="RecentCloudimg" src={RecentCloud}></img>
                        <span>최근 문서함</span>
                    </div>
                    <div className="ImportantCloud List">
                        <img className="ImportantCloudimg" src={ImportantCloud}></img>
                        <span>중요 문서함</span>
                    </div>
                    <div className="TrashCloud List">
                        <img className="TrashCloudimg" src={TrashCloud}></img>
                        <span>휴지통</span>
                    </div>
                </div>
                <div className="DiskSpace">
                    <img src={Disk} />
                    <span className="DiskName">저장 공간</span>
                    <div className="DiskFree">{ByteCal(this.state.DiskSize)+" / "+ByteCal(this.state.FreeDiskSpace)}</div>
                    <div className="Diskprogress">
                        <div style={{width: 100-this.state.FreeDiskSpace*100/this.state.DiskSize+"%"}}></div>
                    </div>
                </div>
            </div>
        )
    }
}


export default SideBar;