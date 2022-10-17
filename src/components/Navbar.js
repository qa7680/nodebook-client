import Navbar from 'react-bootstrap/Navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faFacebook} from '@fortawesome/free-brands-svg-icons';
import {faFacebookMessenger} from '@fortawesome/free-brands-svg-icons'
import {faBell, faMagnifyingGlass} from '@fortawesome/free-solid-svg-icons';
import {faHome} from '@fortawesome/free-solid-svg-icons';
import {faUserFriends} from '@fortawesome/free-solid-svg-icons';
import {faTv} from '@fortawesome/free-solid-svg-icons';
import {faUsers} from '@fortawesome/free-solid-svg-icons';
import {faBars} from '@fortawesome/free-solid-svg-icons';
import {faGear} from '@fortawesome/free-solid-svg-icons';
import {faRightFromBracket} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import Dropdown from 'rc-dropdown';
import Menu, { Item as MenuItem, Divider } from 'rc-menu';
import 'rc-dropdown/assets/index.css'
import '../styling/navbar.css';

const NavbarComponent = ({userImage, user, logout}) => {

    // profile dropdown
    const menuCallback = () => (
        <Menu class="popoutCard">
          <MenuItem>
          <a href = {`/users/${user._id}`} style={{textDecoration: 'none', color: 'inherit'}}>
            <div class="popoutMenu">
                <img src={userImage} style={{borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer',
                objectFit: 'cover'}}/>
                <strong>{user.first_name} {user.last_name}</strong>
            </div>
            </a>
          </MenuItem>
          <div class="vl"></div>
          <MenuItem>
          <Link to = "/settings" style={{textDecoration: 'none', color: 'inherit'}}>
          <div class="popoutMenu">
            <FontAwesomeIcon icon={faGear} style={{color: 'black', fontSize: 'large'}} className="popoutIcon"/>
            Settings
          </div>
          </Link>
          </MenuItem>
          
          <div onClick={() => logout()} class="popoutMenu">
            <FontAwesomeIcon icon={faRightFromBracket} style={{color: 'black', fontSize: 'large'}} className="popoutIcon"/>
            Logout
          </div>
        </Menu>
      );
          
    return (
        <Navbar style={{backgroundColor: 'white', boxShadow: '1px 4px 12px 0px rgba(0,0,0,0.07)',
        display: 'flex', justifyContent: 'space-between', padding: '0.5rem 1rem', width: '100%'}}>
                <div class="navLeft" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', width: '33.33%'}}>
                <Link to = "/"><FontAwesomeIcon icon={faFacebook} size="3x" style={{color: '#0165E1'}}/></Link>
                    <div class = "input-group" style={{width: '50%'}}>
                    <span class="input-group-text" id="basic-addon1">
                    <FontAwesomeIcon icon={faMagnifyingGlass} style={{color: 'grey'}}/>
                    </span>
                        <input  type="text" class="form-control" placeholder='Search nodebook' style={{padding: '0.4rem 1rem'}}/>
                    </div>
                </div>
                <div class="navMiddle" style={{display: 'flex', alignItems: 'center', width: '33.33%', justifyContent: 'center'}}>
                    <Link to = "/" className="iconLinks"><FontAwesomeIcon icon={faHome} style={{color: 'grey'}}
                    className="midIcon"/></Link>
                    <Link to ="/friends" className="iconLinks"><FontAwesomeIcon icon={faUserFriends} style={{color: 'grey'}}
                    className="midIcon"/>
                    </Link>
                    <Link to = "/live" className="iconLinks"><FontAwesomeIcon icon={faTv} style={{color: 'grey'}}
                    className="midIcon"/>
                    </Link>
                    <Link to = "/discover" className="iconLinks"><FontAwesomeIcon icon={faUsers} style={{color: 'grey'}}className="midIcon"/>
                    </Link>
                </div>
                <div class= "navRight" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent:'flex-end',
                width: '33.33%'}}>
                    <FontAwesomeIcon icon={faBars} style={{color: '#606060', fontSize: 'large'}} className="rightIcon"/>
                    <FontAwesomeIcon icon={faFacebookMessenger} style={{color: '#606060', fontSize: 'large'}} className="rightIcon"/>
                    <FontAwesomeIcon icon={faBell} style={{color: '#606060', fontSize: 'large'}} className="rightIcon"/>
                    <div>
                    <Dropdown
                        trigger={['click']}
                        overlay={menuCallback}                        
                    >
                        <img src={userImage} style={{overflow: 'hidden',width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer',
                      objectFit: 'cover'}}/>
                    </Dropdown>
                    </div>
                </div>
        </Navbar>
    );
};

export default NavbarComponent;