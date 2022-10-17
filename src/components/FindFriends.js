import NavbarComponent from "./Navbar";
import { Spinner } from "react-bootstrap";
import "../styling/findfriends.css";
import { useState, useEffect, useContext } from "react";
import { UserContext } from "../UserContext";
import { Link, useNavigate } from "react-router-dom";

const FindFriends = () => {

    const [user, setUser] = useState([]);
    const [userImg, setUserImg ] = useState('');
    const [loadingUser, setLoadingUser] = useState(true);
    const [discover, setDiscover] = useState([]);
    const [loadingDiscover, setLoadingDiscover] = useState(false);

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
            setUser(data.user);   
            setLoadingUser(false);                 
        });
    };

    // fetch user discover
    function fetchDiscover() {
        setLoadingDiscover(true);
        fetch(`https://cryptic-earth-09230.herokuapp.com/users/${userObject.user}/discover`, { mode: 'cors', method: 'GET' })
            .then(res => res.json())
            .then(data => {
                var arr = []
                data.users.map((single_user) => {
                    const userArr = single_user;
                    if(single_user.profile_pic){
                        const blob = new Blob([Int8Array.from(single_user.profile_pic.data.data)], {type: single_user.profile_pic.contentType});
                        const image = window.URL.createObjectURL(blob);
                        userArr['user_image'] = image
                    }else{
                        userArr['user_image'] = require('../images/egg.jpg')
                    }
                    single_user.requests.map((request) => {
                        if(request === userObject.user){
                            userArr['request_sent'] = true;
                        }else{
                            userArr['request_sent'] = false;
                        }
                    });                                                                     
                    arr.push(userArr);
                })
                setDiscover(arr);
                setLoadingDiscover(false);
            })
    };

    // get user once
    useEffect(() => {
        if(userObject){
        setLoadingUser(true);
        fetchUser();
        fetchDiscover();
        }else{
            navigate('/')
        }
    }, []);  
    
    // log user out
    const logout = () => {
        setLoadingUser(true);
        setTimeout(() => {
            localStorage.clear();
            setUser([]);
            setUserImg([]);
            setUserObject(''); 
            setLoadingUser(false);
            navigate('/')
        },500)
    }; 

    // send friend request
    const addFriend = (recipient) => {
        fetch(`https://cryptic-earth-09230.herokuapp.com/users/${userObject.user}/request`, {
            mode: 'cors', method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
                recipient: recipient._id
            })
        })
            .then(res => res.json())
            .then(data => console.log(data));
            
            setDiscover(discover.map((single_user) => {
                if(single_user._id === recipient._id){
                    single_user.request_sent = true
                };
                return single_user;
            }))

    };

    // Cancel friend request    
    const cancelRequest = (recipient) => {
        fetch(`https://cryptic-earth-09230.herokuapp.com/users/${userObject.user}/cancel`, {
            mode: 'cors', method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
                recipient: recipient._id
            })
        })
            .then(res => res.json())
            .then(data => console.log(data));

            setDiscover(discover.map((single_user) => {
                if(single_user._id === recipient._id){
                    single_user.request_sent = false
                };
                return single_user;
            }))
    };
    
    return(
        <div style={{minHeight: '100vh'}}>   
        {
            loadingUser ? <div className="discoverContainer"><Spinner animation = "border" /></div> :
            <div style={{minHeight: 'inherit'}}>
            <NavbarComponent userImage = {userImg} user={user} logout={logout}/>
            {
                loadingDiscover ? <div style={{minHeight: '80vh', display: 'flex'
                , justifyContent: 'center', alignItems: 'center'}}><Spinner animation="border"/></div> :
            <div className="discoverContainerCard">
                <div className="card" style={{width: '40%', maxHeight: '75%'}}>
                <div class="card-body">
                    <h4 class="card-title"><strong>Discover new Friends!</strong></h4>
                    <hr />
                    <p class="card-text cardTextSendRequest"
                    style={{paddingBottom: '1rem'}}>Send a friend request to someone you might know!</p>  
                    {discover.map((single_user) => {
                        return(
                        <div>
                        <div className="userDiscoverDiv"> 
                            <a href = {`/users/${single_user._id}`} className="routeLinks">                           
                            <div className="userDiscoverDivLeft">
                                <img src= { single_user.user_image } className="discoverUserImg" />
                                <p className ="userDiscoverName">{ single_user.first_name } {single_user.last_name}</p>
                            </div>
                            </a>
                            {                                   
                                !single_user.request_sent ? <button className="addFriendBtn" onClick={() => {addFriend(single_user)}}>
                                <img src={require('../images/add_friend_4.png')}/>Add Friend</button>                  
                                :                                
                                <button className="addFriendBtn addFriendBtnCancel" onClick={() => cancelRequest(single_user)}>
                                    <img src={require('../images/add_friend_4.png')} />Cancel Request</button>          
                            }                            
                        </div> 
                        <hr />
                        </div>
                        )                 
                    })                    
                    }
                </div>
                </div>
            </div>
            }
            </div>
        }            
        </div>
    );
};

export default FindFriends;