import { useContext, useState, useEffect } from "react";
import { UserContext } from "../UserContext";
import NavbarComponent from "./Navbar";
import { Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../styling/settings.css"
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

const Settings = () => {

    const [user, setUser] = useState([]);
    const [userImg, setUserImg ] = useState('');
    const [loadingUser, setLoadingUser] = useState(true);
    const [disableBtn, setDisableBtn] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const {userObject, setUserObject} = useContext(UserContext);

    const navigate = useNavigate();

    // fetch user 
    function fetchUser() {
        fetch(`https://cryptic-earth-09230.herokuapp.com/users/${userObject.user}`, { mode: 'cors', method: 'GET' })
            .then(res => res.json())
            .then(data => {
                if(data.user.profile_pic){
                    const blob = new Blob([Int8Array.from(data.user.profile_pic.data.data)], {type: data.user.profile_pic.contentType});
                    const image = window.URL.createObjectURL(blob);
                    setUserImg(image)        
                }else{
                    setUserImg(require('../images/egg.jpg'));
                }
            if(userObject.user === '634c8bd3851e30a04d0be532'){
                setDisableBtn(true);
            };
            setUser(data.user);   
            setLoadingUser(false);                 
        });
    };
    
    // log user out
    const logout = () => {
        setLoadingUser(true);
        setTimeout(() => {
            localStorage.clear();
            setUser([]);
            setUserImg([]);
            setUserObject(''); 
            setLoadingUser(false);
            navigate('/');
        },500)
    };

    // get user once
    useEffect(() => {
        if(userObject){
        setLoadingUser(true);
        fetchUser();       
        }else{
            navigate('/')
        }
    }, []) 

    // hide modal
    const hideConfirmDeletePost = () => {
        setConfirmDelete(false);
    };

    // delete account
    const deleteAccount = () => {
        fetch(`https://cryptic-earth-09230.herokuapp.com/users/${userObject.user}`, {
            mode: 'cors', method: 'DELETE'
        })
            .then(res => res.json())
            .then(data => {
                logout();
            });
    };

    return(
        <div style={{minHeight: "100vh"}}>
            {loadingUser ? <div style={{minHeight: 'inherit', display: 'flex', alignItems: 'center', 
            justifyContent: 'center'}}>                
                <Spinner animation = "border" />
            </div>
            :
        <div>
            <Modal show={confirmDelete} onHide={hideConfirmDeletePost} centered>
                                        <Modal.Header closeButton>
                                          <Modal.Title>Delete Account</Modal.Title>
                                        </Modal.Header>
                                        <Modal.Body>Are you sure you want to permanently your account?</Modal.Body>
                                        <Modal.Footer>
                                          <Button variant="secondary" onClick={() => {hideConfirmDeletePost()}}>
                                            Cancel
                                          </Button>
                                          <Button variant="warning" onClick={deleteAccount}>
                                            Delete
                                          </Button>
                                        </Modal.Footer>
            </Modal>
        <NavbarComponent userImage = {userImg} user={user} logout={logout}/>
        <div className="deleteAccountContainer">
            <div className="card deleteAccountCard">                
                <h4 class="card-title"><strong>Settings</strong></h4>
                <div>
                    <h5>Deleting Your Account</h5>
                    {disableBtn && <p>(This is a test account. It can not be deleted.)</p>}
                    <hr />
                </div>
                <p>
                   Deleting your account means you will no longer have access to it. All of your posts, images and comments will be
                   removed and you will no longer be able to retrieve any data associated with your account.
                </p>
                <button disabled={disableBtn} className="DeleteAccountBtnConfirm" onClick={() => setConfirmDelete(true)}>
                Delete Account</button>            
            </div>
        </div>
        </div>
        }
        </div>
    );
};

export default Settings;