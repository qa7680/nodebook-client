import { useContext, useState, useEffect } from "react";
import "../styling/userprofile.css"
import { UserContext } from "../UserContext";
import NavbarComponent from "./Navbar";
import { Spinner } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import DeletePost from "./DeletePost";
import { DateTime } from 'luxon';
import DeleteComment from "./DeleteComment";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import imageCompression from 'browser-image-compression';

const UserProfile = () => {

    const [user, setUser] = useState([]);
    const [userImg, setUserImg ] = useState('');
    const [loadingUser, setLoadingUser] = useState(true);
    const [profile, setProfile] = useState([]);
    const [profileFriends, setProfileFriends] = useState([]);    
    const [profileSent, setProfileSent] = useState([]);
    const [profileImages, setProfileImages] = useState([]);
    const [profilePosts, setProfilePosts] = useState([]);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [currentPost, setCurrentPost] = useState([]);
    const [commentField, setCommentField] = useState('');
    const [comments, setComments] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [profilePicture, setProfilePicture] = useState('');

    const {userObject, setUserObject} = useContext(UserContext);

    const navigate = useNavigate();
    let { userId } = useParams();

    // fetch user **for navbar
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

    // fetch profile that we clicked on
    function fetchProfile() {
        fetch(`http://localhost:8000/users/${userId}`, {
            mode: 'cors', method: 'GET'
        })
            .then(res => res.json())
            .then(data => {
                const profile = data.user
                if(data.user.profile_pic){
                    const blob = new Blob([Int8Array.from(data.user.profile_pic.data.data)], {type: data.user.profile_pic.contentType});
                    const image = window.URL.createObjectURL(blob);
                    profile['profile_image'] = image
                    setProfilePicture(image);       
                }else{
                    profile['profile_image'] = (require('../images/egg.jpg'));
                    setProfilePicture(require('../images/egg.jpg'));
                }
                setProfile(profile);
            });
    };

    // Like a post
    const likePost = (post) => {
        if (!post.likes.includes(userObject.user)) {
        fetch(`http://localhost:8000/posts/${post._id}/like`, {
            mode: 'cors', method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
                userId: userObject.user
            })
        })
            .then(res => res.json())
            .then(data => console.log(data))

        setProfilePosts(profilePosts.map((single_post) => {
            if(single_post._id === post._id){
                single_post.likes_length = single_post.likes_length + 1;
                var arr = single_post.likes;
                arr.push(userObject.user);
                single_post.likes = arr;  
            };
            return single_post;
        }));
    }};

    // Unlike a post
    const unlikePost = (post) => {
        if(post.likes.includes(userObject.user)){
            fetch(`http://localhost:8000/posts/${post._id}/unlike`, {
                mode: 'cors', method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({
                    userId: userObject.user
                })
            })
                .then(res => res.json())
                .then(data => console.log(data));

                setProfilePosts(profilePosts.map((single_post) => {
                    if(single_post._id === post._id){
                        single_post.likes_length = single_post.likes_length - 1;
                        var arr = single_post.likes;
                        arr = arr.filter(e => e !== userObject.user)
                        single_post.likes = arr;  
                    };
                    return single_post;
                }));
        };
    };

    // add a comment
    const addComment = (e, post) => {
        e.preventDefault();
        fetch(`http://localhost:8000/posts/${post._id}/comments` , {
            mode: 'cors', method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
                author: userObject.user,
                comment: commentField
            })
        })
            .then(res => res.json())
            .then(data => {                
                e.target.reset();
                const comment = {
                    author: {
                        first_name: user.first_name, last_name: user.last_name, _id: userObject.user
                    },
                    image: userImg,
                    likes: 0,
                    post: post._id,
                    comment: commentField,
                    _id: data.comment._id,
                    time: timeAgoComments(new Date().toISOString()),
                }
                const commentsArr = comments.slice();
                commentsArr.unshift(comment);
                setComments(commentsArr);  
            })                     
    };

    // show all comments
    const showAllComments = (post) => {
        setProfilePosts(profilePosts.map((single_post) => {
            if(post._id === single_post._id) {
                single_post.showComments = true;
            };
            return single_post;
        }))
    };

    // show less comments 
    const showLessComments = (post) => {
        setProfilePosts(profilePosts.map((single_post) => {
            if(post._id === single_post._id) {
                single_post.showComments = false;
            };
            return single_post;
        }));
    };

    // delete comment
    const deleteComment = (comment) => {
        fetch(`http://localhost:8000/comments/${comment._id}`, {
            mode: 'cors', method: 'DELETE'
        })
            .then(res => res.json())
            .then(data => console.log(data))   
            const commentsArr = comments.slice();
            for(let i = 0; i<commentsArr.length; i++) {
                if(commentsArr[i]._id === comment._id){
                    commentsArr.splice(i,1)
                };
            }
            setComments(commentsArr);     
    };
    
    const fetchProfileFriends = () => {
    fetch(`http://localhost:8000/users/${userId}/friends`, {
        mode: 'cors', method: 'GET'
    })
        .then(res => res.json())
        .then(data => {                        
            const friendsArr = [];
            const receivedArr = [];
            data.friendsList.map((friend) => {
                const single_friend = friend;
                if(friend.profile_pic){
                    const blob = new Blob([Int8Array.from(friend.profile_pic.data.data)], {type: friend.profile_pic.contentType});
                    const image = window.URL.createObjectURL(blob);
                    single_friend['profile_image'] = image
                }else{
                    single_friend['profile_image'] = require('../images/egg.jpg')
                }
                friendsArr.push(single_friend);
            });
            data.received.map((person) => {
                const single_person = person._id;
                receivedArr.push(single_person);
            })            
            setProfileFriends(friendsArr);
            setProfileSent(receivedArr);
    })};        

    // fetch profile Images
    const fetchImages = () => {
        fetch(`http://localhost:8000/users/${userId}/images`, {
            mode: 'cors', method: 'GET'
        })
            .then(res => res.json())
            .then(data => {
                var imagesArr = [];
                data.images.map((image) => {
                    const single_image = image;
                    const blob = new Blob([Int8Array.from(image.image.data.data)], {type: image.image.contentType});
                    const image_created = window.URL.createObjectURL(blob);
                    single_image['photo'] = image_created
                    imagesArr.push(single_image);
                })
                setProfileImages(imagesArr)
            });
    };    

    // fetch profile posts
    const fetchPosts = () => {
        fetch(`http://localhost:8000/posts/profile/${userId}`, {
            mode: 'cors', method: 'GET'
        })
            .then(res => res.json())
            .then(data => {                
                var arr = [];
                data.posts.map((post) => {
                    const single_post = post;
                    single_post['showComments'] = false
                    if(post.author.profile_pic){
                        const blob = new Blob([Int8Array.from(post.author.profile_pic.data.data)], {type: post.author.profile_pic.contentType});
                        const image_created = window.URL.createObjectURL(blob);
                        single_post['author_photo'] = image_created;
                        single_post['time'] = timeAgo(post.time);
                    }else{
                        single_post['author_photo'] = require('../images/egg.jpg')
                    }                                        
                    data.postImages.map((image) => {
                        if(image.post === post._id){
                            const blob = new Blob([Int8Array.from(image.image.data.data)], {type: image.image.contentType});
                            const image_post = window.URL.createObjectURL(blob);
                            single_post['post_image'] = image_post
                        }
                    });
                    arr.push(single_post);
                });
                var comments = [];
                data.comments.map((comment) => {
                    const commentArr = comment;    
                    if(comment.author.profile_pic){                        
                    const blob = new Blob([Int8Array.from(comment.author.profile_pic.data.data)], {type: comment.author.profile_pic.contentType});
                    const image = window.URL.createObjectURL(blob);
                    commentArr['image'] = image;
                    }else{
                        commentArr['image'] = (require('../images/egg.jpg'))
                    }
                    commentArr['time'] = timeAgoComments(comment.time);                            
                    comments.push(commentArr);
                })                        
                setProfilePosts(arr);
                setComments(comments);    
                setLoadingPosts(false);            
            })
    };            
    // get user once
    useEffect(() => {        
        if(userObject){
        setLoadingUser(true); 
        setTimeout(() => {                                                                                
            fetchUser();
            fetchImages();  
            fetchPosts();                                                 
        }, 1000);                
        fetchProfile();
        fetchProfileFriends();          
        }else{
            navigate('/');
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

    const confirmDeletePost = (post) => {
        setConfirmDelete(true);
        setCurrentPost(post);                      
    };

     // time formatting
     const units = [
        'year',
        'month',
        'week',
        'day',
        'hour',
        'minute',
        'second',
    ];

    const timeAgo = (date) => {
        let dateTime = DateTime.fromISO(date)
        const diff = dateTime.diffNow().shiftTo(...units);
        const unit = units.find((unit) => diff.get(unit) !== 0) || 'second';
      
        const relativeFormatter = new Intl.RelativeTimeFormat('en', {
          numeric: 'auto',
        });
        return relativeFormatter.format(Math.trunc(diff.as(unit)), unit);
    };

    const timeAgoComments = (date) => {
        let dateTime = DateTime.fromISO(date)
        const diff = dateTime.diffNow().shiftTo(...units);
        const unit = units.find((unit) => diff.get(unit) !== 0) || 'second';
      
        const relativeFormatter = new Intl.RelativeTimeFormat('en', {
          numeric: 'auto',
        });
        const time =  relativeFormatter.format(Math.trunc(diff.as(unit)), unit);
        const formatted = time.split(' ');
        if(time === 'now') {return 'now'} else if(time === 'yesterday') {
            return '1d'
        } else{
            return formatted[0].concat(formatted[1].charAt(0))
        };
    };

    // Delete post
    const deletePost = (post) => {
        fetch(`http://localhost:8000/posts/${post._id}`, {
        mode: 'cors', method: 'DELETE'
    })
        .then(res => res.json())
        .then(data => console.log({
        msg: 'Post deleted',
        post_info: data
        }));        
        const postsArr = profilePosts.slice();
        for(let i = 0; i<postsArr.length; i++) {
            if(postsArr[i]._id === post._id){
                postsArr.splice(i,1)
            };
        }
        setProfilePosts(postsArr);
        hideConfirmDeletePost();
    };

    const hideConfirmDeletePost = () => {
        setConfirmDelete(false);
    };

    // handle profile picture change
    const handleProfileChange = (e) => {
        const imageFile = e.target.files[0];        
        const options = {
            maxSizeMB: 0.05,
            maxWidthOrHeight: 1920,
            useWebWorker: true
        }
        imageCompression(imageFile, options)
            .then((compressedImage) => {
                setProfilePicture(window.URL.createObjectURL(
                    new Blob([compressedImage], {
                    type: "image/png", 
                })
                ))

                const form = new FormData();
                form.append('image', compressedImage);
                console.log(compressedImage);
                
                fetch(`http://localhost:8000/users/${userObject.user}/change_profile_picture`, {
                    mode: 'cors', method: 'PUT', body: form
                })
                    .then(res => res.json())
                    .then(data => console.log(data))
            });        
    };    

    return(
        <div className="userProfileContainer">
            {
                loadingUser ? <div className="discoverContainer"><Spinner animation = "border" /></div> :
                <div style={{minHeight: 'inherit'}}>
                <NavbarComponent userImage = {userImg} user={user} logout={logout}/>
                <div className="userProfileContainerCard">
                <img src={require('../images/cover_photo.jpg')} className="coverPhoto"/>                                 
                <div className="absoluteElementDiv">                   
                <div className="userProfileUserInfo">
                    <div className="userProfileUserInfoLeft">                         
                    <img src={profilePicture} className="userProfileUserInfoImg"/>                    
                    <div className="userProfileUserInfoLeftRight">
                        <h2><strong>{profile.first_name} {profile.last_name}</strong></h2>
                        {
                            profileFriends.length===0 ? <></> : profileFriends.length === 1 ? <p className="profileFriendsAmount">1 friend</p> :
                            <p className="profileFriendsAmount">{profileFriends.length} friends</p>
                        }
                        <div className="profileFriendsIconsContainer">
                        {
                            profileFriends.slice(0,5).map((friend) => {
                                return(
                                    <a href={`/users/${friend._id}`}><img src={friend.profile_image} className="profileFriendsIcons"/></a>
                                )
                            })
                        }
                        </div>
                    </div>
                    </div>
                    <div className="userProfileUserInfoRight">
                        {
                            userId === userObject.user ? <></> : profile.friends.includes(userObject.user) ? 
                            <div className="friendsWithProfile">
                                 <Link to = "/friends" className="routeLinks"><button className="friendsWithProfileFriendsBtn"><img src={require('../images/check_5.png')}/>Friends</button></Link>
                                <button className="friendsWithProfileMsgBtn"><img src={require('../images/messenger.png')} style={{
                                    width: '30px', height: '30px', objectFit: 'cover'
                                }}/>Message</button>
                            </div> : profileSent.includes(userObject.user) ? 
                            <Link to = "/friends" className="routeLinks"><button className="addFriendBtn addFriendBtnCancel">
                            <img src={require('../images/add_friend_4.png')} />Cancel Request</button></Link>
                            :
                            user.requests.includes(profile._id) ? <div style={{display: 'flex', gap: '0.3rem'}}><Link to = "/friends" className="routeLinks">
                            <button className="contactFriendsBtnAccept">Accept</button></Link>
                            <Link to = "/friends" className="routeLinks"><button className="contactFriendsBtnDecline"
                            >Delete</button></Link></div>
                            :
                            <Link to = "/discover" className="routeLinks"><button className="friendsWithProfileFriendsBtn"><img src={require('../images/add_friend_4.png')}/>Add Friend</button></Link>
                        }
                    </div>                                
                </div>               
                <div className="profileMainLinksContainer">                                        
                    <div className="profileMainLinks">
                    <hr style={{width: '100%'}}/>
                    <div className="profileMainLinksContainer">
                        <p className="profileMainLinksContainerLinks">Posts</p>
                        <p className="profileMainLinksContainerLinks">About</p>
                        <p className="profileMainLinksContainerLinks">Friends</p>
                        <p className="profileMainLinksContainerLinks">Photos</p>
                    </div>
                    </div>                      
                </div>
                <div className="profileContentMainContainer">
                        <div className="profileContentMainContainerLeft">
                            <div className="card profileContentMainContainerLeftIntro">
                                    <p className="profileContentMainContainerLeftIntroText">Intro</p>
                            </div>
                            <div className="card profileContentMainContainerLeftPhotos">
                                <div className="photosTopLinks">
                                    <p style={{margin: '0', fontWeight: 'bold'}}>Photos</p>
                                    <a className="seeAllPhotos" href="#"><p style={{margin: '0'}}>See all photos</p></a>
                                </div>
                                <div className="profilePagePhotosContainer">
                                    {
                                        profileImages.slice(0,2).map((image) => {
                                            return(
                                                <img src={image.photo} className="profileSingleImage"/>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                            <div className="card profileContentMainContainerLeftPhotos">
                                <div className="photosTopLinks">
                                    <div>
                                        <p style={{margin: '0', fontWeight: 'bold'}}>Friends</p>
                                        {
                                            profileFriends.length===0 ? <></> : profileFriends.length === 1 ? <p className="profileFriendsAmount">1 friend</p> :
                                            <p className="profileFriendsAmount">{profileFriends.length} friends</p>
                                        }
                                    </div>
                                    <a className="seeAllFriends" href="#"><p style={{margin: '0'}}>See all friends</p></a>
                                </div>
                                <div className="profilePagePhotosContainer">
                                    {
                                        profileFriends.slice(0,3).map((friend) => {
                                            return(
                                                <a className="linkToImageFriends" href={`/users/${friend._id}`}>
                                                    <img src={friend.profile_image} className="profileSingleImageFriend"/>
                                                </a>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="profileContentMainContainerRight">
                        <div className="card profileContentMainContainerLeftIntro">
                                <p className="profileContentMainContainerLeftIntroText">Posts</p>
                        </div>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {loadingPosts && <div style={{minHeight: 'inherit', display: 'flex', alignItems: 'center', 
                        justifyContent: 'center'}}>                            
                            <Spinner animation = "border" />
                        </div>
                        }
                        <Modal show={confirmDelete} onHide={hideConfirmDeletePost} centered>
                                        <Modal.Header closeButton>
                                          <Modal.Title>Delete Post</Modal.Title>
                                        </Modal.Header>
                                        <Modal.Body>Are you sure you want to delete this post ?</Modal.Body>
                                        <Modal.Footer>
                                          <Button variant="secondary" onClick={() => {hideConfirmDeletePost()}}>
                                            Cancel
                                          </Button>
                                          <Button variant="danger" onClick={() => deletePost(currentPost)}>
                                            Delete
                                          </Button>
                                        </Modal.Footer>
                        </Modal>
                        {
                        profilePosts.map((post) => {
                            var commentsArr = [];
                            var comments_length = 0;
                            return (
                                <div class="card" style={{border:'1px solid rgb(229, 231, 235)', borderRadius: '10px', width: '100%',
                                padding: '0.6rem'}}>
                                 <div class="card-body" style={{width: '100%', display: 'flex', flexDirection: 'column'}}>
                                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                    <div style={{display: 'flex', gap: '0.6rem', alignItems: 'center'}}>
                                        <a href={`/users/${post.author._id}`} className="routeLinks">
                                            <img src={post.author_photo} style={{borderRadius: '900%', width: '40px', height: '40px',
                                    objectFit: 'cover'}}/></a>
                                        <div>
                                        <a href = {`/users/${post.author._id}`} className="routeLinks">
                                            <p style={{margin: '0', fontWeight: 'bold', color: '#606266'
                                        }}>{post.author.first_name} {post.author.last_name}</p></a>
                                        <p style={{margin: '0', fontSize: '14px', color: '#606266'}}>{post.time}</p>
                                        </div>
                                    </div>
                                    {userObject.user === post.author._id &&
                                    <DeletePost confirmDelete = {() => confirmDeletePost(post)}/>                                                                                                                                            
                                    }
                                    </div>
                                    <div style={{padding: '1.5rem 0'}}>
                                        <p style={{margin: '0', color: '#606266', fontSize: 'large'}}>{post.post}</p>
                                        {
                                        post.post_image && 
                                            <img src={post.post_image} className="postImage"/>                                        
                                        }
                                    </div>                                                                        
                                    <div style={{display: 'flex', alignItems: 'center', gap: '0.2rem', paddingBottom: '0.5rem'}}>
                                        <img src={require('../images/like_symbol_2.png')}/>
                                        <p style={{margin: '0'}}>{post.likes_length}</p>
                                    </div>
                                    <hr style={{borderTop: '1px solid #606266', margin: '0.3rem 0'}}/>
                                    <div style={{display: 'flex', gap: '2rem', justifyContent: 'center', alignItems: 'center'}}>
                                       {!post.likes.includes(userObject.user) ?
                                            <div onClick={() => likePost(post)} className="postIcons"> 
                                            <img src={require('../images/like_symbol_4.png')} />
                                            <p style={{margin: '0', fontWeight: 'bold'}}>Like</p>
                                            </div>
                                            :
                                            <div onClick={() => unlikePost(post)} className="postIcons"> 
                                            <img src={require('../images/like_symbol_4.png')} />
                                            <p style={{margin: '0', fontWeight: 'bold', color: 'navy'}}>Unlike</p>
                                            </div>
                                        }
                                        <div className="postIcons">
                                        <img src={require('../images/comment_symbol.png')} />
                                        <p style={{margin: '0', fontWeight: 'bold'}}>Comment</p>
                                        </div>
                                        <div className="postIcons">
                                        <img src={require('../images/share_icon.png')} />
                                        <p style={{margin: '0', fontWeight: 'bold'}}>Share</p>
                                        </div>
                                    </div>
                                    <hr style={{borderTop: '1px solid #606266', margin: '0.3rem 0'}}/>
                                    <form onSubmit={(e) => addComment(e, post)} className="postCommentDiv">
                                        <a href={`/users/${userObject.user}`} className="routeLinks">
                                            <img src={userImg} style={{borderRadius: '50%', width: '30px', height: '30px', 
                                    objectFit: 'cover'}}/></a>
                                        <input onChange={(e) => setCommentField(e.target.value)}
                                        class="commentInput" placeholder="Write a comment..." />
                                    </form>    
                                    {
                                        comments.map((comment) => {
                                            if(comment.post === post._id){
                                                comments_length +=1;
                                                commentsArr.push(comment);
                                            }
                                        })
                                    }
                                    {
                                        comments_length>3 ? post.showComments === false ? <div onClick={() => showAllComments(post)}
                                        className="commentsLength">{comments_length} comments</div>:
                                        <div onClick={() => showLessComments(post)}
                                        className="commentsLength">Hide Comments...</div>
                                        :<></>
                                    }                                                                    
                                    {
                                        post.showComments === false ?
                                        commentsArr.slice(0,3).map((comment) => {                                            
                                            if(comment.post === post._id){                                                
                                                return( 
                                                <div className="showCommentsSection">
                                                    <a className="routeLinks" href={`/users/${comment.author._id}`}>
                                                        <img src={comment.image} style={{borderRadius: '900%', width: '30px', height: '30px',
                                                objectFit: 'cover'}}/></a>
                                                    <div style={{display: 'flex', flexDirection: 'column'}}>
                                                        <div className="postComment">
                                                        <a className="routeLinks" href={`/users/${comment.author._id}`}>
                                                            <p style={{margin: '0', fontSize: '15px'}}>
                                                                <strong>{comment.author.first_name} {comment.author.last_name}</strong></p>
                                                        </a>
                                                            <p className="commentCommentComment">{comment.comment}</p>
                                                        </div>                                                        
                                                        <p style={{margin: '0'}} className="timeComment">{comment.time}</p>                                                        
                                                    </div>
                                                    {
                                                        comment.author._id === userObject.user && <DeleteComment 
                                                        deleteComment={() => deleteComment(comment)}/>
                                                    }                                                                                                                                                            
                                                 </div>
                                                )
                                            }
                                        })                           
                                        : comments.map((comment) => {                                            
                                            if(comment.post === post._id){                                                
                                                return( 
                                                <div className="showCommentsSection">
                                                    <a className="routeLinks" href={`/users/${comment.author._id}`}><img src={comment.image} style={{borderRadius: '900%', width: '30px', height: '30px',
                                                objectFit: 'cover'}}/></a>
                                                    <div style={{display: 'flex', flexDirection: 'column'}}>
                                                        <div className="postComment">
                                                        <a className="routeLinks" href={`/users/${comment.author._id}`}>
                                                            <p style={{margin: '0', fontSize: '15px'}}>
                                                                <strong>{comment.author.first_name} {comment.author.last_name}</strong></p>
                                                        </a>
                                                            <p className="commentCommentComment">{comment.comment}</p>
                                                        </div>
                                                        <p style={{margin: '0'}} className="timeComment">{comment.time}</p>
                                                    </div> 
                                                    {
                                                        comment.author._id === userObject.user && <DeleteComment 
                                                        deleteComment={() => deleteComment(comment)}/>
                                                    }                                                                                                         
                                                 </div>
                                                )
                                            }
                                        })              
                                    }                                         
                                </div>
                            </div>
                            )
                        })
                    }
                    </div>
                    </div>                        
                </div>
                </div>
                {userObject.user === profile._id &&
                <label title="change profile picture">
                        <img src= {require('../images/profile_pic3.png')} className="changeProfilePic"/>
                        <input type="file" name="image" style={{display: "none"}} 
                        onChange={(e) => handleProfileChange(e)} accept="image/png, image/jpeg, image/jpg"/>
                </label>                               
                }
                </div>
                </div>
            }
        </div>
    );
};

export default UserProfile;