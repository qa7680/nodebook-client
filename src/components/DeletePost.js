import Dropdown from 'rc-dropdown';
import Menu, { Item as MenuItem, Divider } from 'rc-menu';
import 'rc-dropdown/assets/index.css'
import {faTrash, faEllipsisH} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import '../styling/navbar.css';

const DeletePost = ({ confirmDelete }) => {    
    
    // Delete dropdown
    const menuCallback = () => (
        <Menu class="popoutCard">                                                      
          <div onClick={confirmDelete} class="deleteMenu">
            <FontAwesomeIcon icon={faTrash} style={{color: 'black', fontSize: 'large'}} className="popoutIcon"/>
            Delete Post
          </div>
        </Menu>
        
      );
    
      return(
        <Dropdown
        trigger={['click']}
        overlay={menuCallback} 
        placement="bottomRight"                       
        >   
        <FontAwesomeIcon icon={faEllipsisH} className="ellipsisFont"/>
        </Dropdown>
      );
};

export default DeletePost;