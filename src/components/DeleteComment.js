import Dropdown from 'rc-dropdown';
import Menu, { Item as MenuItem, Divider } from 'rc-menu';
import 'rc-dropdown/assets/index.css'
import {faTrash, faEllipsisH, } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import '../styling/userdash.css'

const DeleteComment = ({ deleteComment }) => {    
    
    // Delete dropdown
    const menuCallback = () => (
        <Menu class="popoutCard">                                                      
          <div onClick={() => deleteComment()} class="deleteMenu">
          <FontAwesomeIcon icon={faTrash} style={{padding: '0.5rem 0.6rem'}}/>
            Delete Comment
          </div>
        </Menu>        
      );    
      return(
        <Dropdown
        trigger={['click']}
        overlay={menuCallback}                                
        >   
        <FontAwesomeIcon icon={faEllipsisH} className="ellipsisComment"/>
        </Dropdown>
      );
};

export default DeleteComment;