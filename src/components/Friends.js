import NavbarComponent from "./Navbar";
import { Spinner } from "react-bootstrap";
import "../styling/friends.css";
import { useState, useEffect, useContext } from "react";
import { UserContext } from "../UserContext";
import { Link, useNavigate } from "react-router-dom";
import EmptyContacts from "./EmptyContacts";

const Friends = () => {
    const [user, setUser] = useState([]);
    const [userImg, setUserImg ] = useState('');
    const [loadingUser, setLoadingUser] = useState(true);
    const [contacts, setContacts] = useState([]);
    const [sent, setSent] = useState([]);
    const [received, setReceived] = useState([]);
    const [loadingContacts, setLoadingContacts] = useState(false);

    const {userObject, setUserObject} = useContext(UserContext);

    const navigate = useNavigate();

    // fetch user 
    function fetchUser() {
        fetch(`https://qa7680-nodebook-api.onrender.com/users/${userObject.user}`, { mode: 'cors', method: 'GET' })
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
    
    // fetch friends status
    const fetchStatus = () => {
        setLoadingContacts(true);
        fetch(`https://qa7680-nodebook-api.onrender.com/users/${userObject.user}/friends`, {
            mode: 'cors', method: 'GET'
        })
            .then(res => res.json())
            .then(data => {                
                var contactsArr = [];
                var receivedArr = [];
                var sentArr = [];
                data.friendsList.map((friend) => {
                    const friendArr = friend
                    if(friend.profile_pic){
                        const blob = new Blob([Int8Array.from(friend.profile_pic.data.data)], {type: friend.profile_pic.contentType});
                        const image = window.URL.createObjectURL(blob);
                        friendArr['user_image'] = image;
                    }else{
                        friendArr['user_image'] = require('../images/egg.jpg')
                    }
                    friendArr['unfriend'] = false;
                    contactsArr.push(friendArr);                    
                });
                data.received.map((user) => {
                    const userArr = user
                    if(user.profile_pic){
                        const blob = new Blob([Int8Array.from(user.profile_pic.data.data)], {type: user.profile_pic.contentType});
                        const image = window.URL.createObjectURL(blob);
                        userArr['user_image'] = image
                    }else{
                        userArr['user_image'] = require('../images/egg.jpg')
                    }
                    userArr['request_accepted'] = false;                   
                    receivedArr.push(userArr);
                });
                data.sent.map((user) => {
                    const userArr = user
                    if(user.profile_pic){
                        const blob = new Blob([Int8Array.from(user.profile_pic.data.data)], {type: user.profile_pic.contentType});
                        const image = window.URL.createObjectURL(blob);
                        userArr['user_image'] = image
                    }else{
                        userArr['user_image'] = require('../images/egg.jpg')
                    }
                    sentArr.push(user);
                });
                setContacts(contactsArr);
                setReceived(receivedArr);
                setSent(sentArr);
                setLoadingContacts(false);
            });            
    };

    // get user once
    useEffect(() => {
        if(userObject){
        setLoadingUser(true);
        fetchUser();        
        fetchStatus();
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

    // unfriend a user
    const unfriend = (user) => {
        fetch(`https://qa7680-nodebook-api.onrender.com/users/${userObject.user}/unfriend`, {
            mode: 'cors', method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
                requester: user._id
            })
        })
            .then(res => res.json())
            .then(data => console.log(data))
            setContacts(contacts.map((contact) => {
                if(contact._id === user._id){
                    contact.unfriend = true
                };
                return contact;
            })      
            );                       
    };

    // accept a friend request
    const acceptRequest = (user) => {
        fetch(`https://qa7680-nodebook-api.onrender.com/users/${userObject.user}/accept`, {
            mode: 'cors', method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
                requester: user._id
            })
        })
            setReceived(received.map((single_user) => {
                if(single_user._id === user._id){
                    single_user.request_accepted = true;
                }
                return single_user
            }));
    };

    // decline a friend request
    const declineRequest = (user) => {
        fetch(`https://qa7680-nodebook-api.onrender.com/users/${userObject.user}/decline`, {
            mode: 'cors', method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
                requester: user._id
            })
        });
            const recievedArr = received.slice();
            for(let i = 0; i<recievedArr.length; i++) {
                if(user._id === recievedArr[i]._id){
                    recievedArr.splice(i,1)
                };
            };
            setReceived(recievedArr);
    };

    // cancel a request sent
    const cancelRequest = (user) => {
        fetch(`https://qa7680-nodebook-api.onrender.com/users/${userObject.user}/cancel`, {
            mode: 'cors', method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
                recipient: user._id
            })
        })
            const sentArr = sent.slice();
            for(let i = 0; i<sentArr.length; i++) {
                if(user._id === sentArr[i]._id){
                    sentArr.splice(i, 1)
                };
            };
            setSent(sentArr);
    };

    return(
        <div style={{minHeight: '100vh'}}>   
        {
            loadingUser ? <div className="discoverContainer"><Spinner animation = "border" /></div> :
            <div style={{minHeight: 'inherit'}}>
            <NavbarComponent userImage = {userImg} user={user} logout={logout}/> 
            {
                loadingContacts ? <div style={{minHeight: '80vh', display: 'flex'
            , justifyContent: 'center', alignItems: 'center'}}><Spinner animation = "border" /></div> :
            <div style={{padding: '2.5rem 4rem'}}>
                {    
                    (contacts.length===0 && received.length===0 && sent.length===0) &&
                    <EmptyContacts />
                }                
                {contacts.length >0 &&                                
            <div className="friendsPageTop">                                             
                <h4 class="card-title"><strong>Contacts</strong></h4>               
                <div style={{display: 'flex', gap: '2rem', padding: '1rem 0'}}>                                
                {
                    contacts.map((contact) => {
                    return(
                        <div className="contactCard">                            
                            <img src={ contact.user_image } className = "contactsUserImg"/>
                            <a className="routeLinks" href={`/users/${contact._id}`}><p className="contactFirstLast">{ contact.first_name } { contact.last_name }</p></a>
                            {!contact.unfriend ?                        
                            <div className="contactFriendsBtnDiv">
                                <button className="contactFriendsBtn" onClick={() => unfriend(contact)}>
                                    <img src={require('../images/check.png')} style={{width: '15px'}} />
                                Friends</button>
                            </div>
                            :
                            <div className="contactFriendsBtnDiv">
                                <button className="contactFriendsBtnUnfriended">                                    
                                    Unfriended</button>
                            </div>
                            }
                        </div>
                    )
                    })
                }
                </div>
                <hr />
            </div>
            }
            
            <div className="friendsPageBottom">                             
            {received.length>0 &&
            <div style={{paddingTop: '0rem'}}>                                                      
            <h4 class="card-title"><strong>Friend Requests</strong></h4>    
            <div style={{display: 'flex', gap: '2rem', padding: '1rem 0'}}>              
                {
                    received.map((contact) => {
                    return(
                        <div className="contactCard">                            
                            <img src={ contact.user_image } className = "contactsUserImg"/>
                            <a href = {`/users/${contact._id}`} className="routeLinks"><p className="contactFirstLast">{ contact.first_name } { contact.last_name }</p> </a>
                            {(contact.request_accepted === false && contact.request_accepted === false) ?                            
                            <div className="contactFriendsBtnDiv"><button onClick={() => acceptRequest(contact)}
                            className="contactFriendsBtnAccept">Accept</button>
                            <button className="contactFriendsBtnDecline"
                            onClick= {() => declineRequest(contact)}>Delete</button></div>
                            :
                            contact.request_accepted === true &&
                            <button className="contactFriendsBtn requestAccpetedBtn">
                                    <img src={require('../images/check.png')} style={{width: '15px'}} />
                            Friends</button>                            
                            }
                        </div>
                    )
                    })
                }                        

                </div>
                <hr />                   
                </div>
                }                               
                <div>
                    {
                        sent.length>0 &&
                 <div>   
                <h4 class="card-title"><strong>Requests Sent</strong></h4>                    
                <div style={{display: 'flex', gap: '2rem', padding: '1rem 0'}}>  
                {
                    sent.map((contact) => {
                        return(
                            <div className="contactCard">                            
                                <img src={ contact.user_image } className = "contactsUserImg"/>
                                <a href={`/users/${contact._id}`} className="routeLinks">
                                    <p className="contactFirstLast">{ contact.first_name } { contact.last_name }</p></a>
                                <div className="contactFriendsBtnDiv">
                                <button className="contactFriendsBtnRequest"
                                onClick={() => cancelRequest(contact)}><img src={require('../images/add_friend_4.png')} />
                                Cancel Request</button></div>
                            </div>
                        )
                        })
                }     
                </div>           
                </div>
                }
                </div>
            </div>
            
            </div>            
            }
            </div>
        }
        </div>
    )
};

export default Friends;