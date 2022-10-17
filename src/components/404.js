import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";
import { Spinner } from "react-bootstrap";
import NavbarComponent from "./Navbar";

const ErrorPage = () => {

    const [user, setUser] = useState([]);
    const [userImg, setUserImg ] = useState('');
    const [loadingUser, setLoadingUser] = useState(true);

    const {userObject, setUserObject} = useContext(UserContext);

    const navigate = useNavigate();

    // fetch user 
    function fetchUser() {
        fetch(`http://localhost:8000/users/${userObject.user}`, { mode: 'cors', method: 'GET' })
            .then(res => res.json())
            .then(data => {
                if(data.user.profile_pic){
                    const blob = new Blob([Int8Array.from(data.user.profile_pic.data.data)], {type: data.user.profile_pic.contentType});
                    const image = window.URL.createObjectURL(blob);
                    setUserImg(image)        
                }else{
                    setUserImg(require('../images/egg.jpg'));
                }            
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

    return(
        <div style={{minHeight: "100vh"}}>
            {loadingUser ? <div style={{minHeight: 'inherit', display: 'flex', alignItems: 'center', 
            justifyContent: 'center'}}>                
                <Spinner animation = "border" />
            </div>
            :
        <div>
            <NavbarComponent userImage = {userImg} user={user} logout={logout}/>
            <div class="d-flex align-items-center justify-content-center emptyContacts">
            <div class="text-center row">
                <div class=" col-md-6">
                    <img src= {require('../images/friends.jpg')} alt=""
                        class="img-fluid emptyContactsImg" />
                </div>
                <div class=" col-md-6 mt-5">                    
                    <p class="lead" style={{paddingBottom: '1rem'}}>
                        This page does not exist. We're sorry about that.
                    </p>
                    <a href="/" class="emptyContactsImgBtn">Homepage</a>
                </div>
            </div>
        </div>
        </div>
        }
        </div>
    );
};

export default ErrorPage;