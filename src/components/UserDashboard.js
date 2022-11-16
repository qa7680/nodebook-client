import { useContext, useEffect, useState } from "react";
import { UserContext } from "../UserContext";
import NavbarComponent from "./Navbar";
import {faVideo, faImages, faFaceSmile, faEllipsisH, faComment} from '@fortawesome/free-solid-svg-icons';
import "../styling/userdash.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PostModal from "./PostModal";
import { Spinner } from "react-bootstrap";
import { DateTime } from 'luxon';
import DeletePost from "./DeletePost";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import DeleteComment from "./DeleteComment";
import { Link } from "react-router-dom";

const UserDashboard = () => {
    const [user, setUser] = useState([]);
    const [timelinePosts, setTimelinePosts] = useState([]);
    const [userImg, setUserImg ] = useState('');
    const [show, setShow] = useState(false);
    const [loadingUser, setLoadingUser] = useState(true);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [posted, setPosted] = useState(false);
    const [commentField, setCommentField] = useState('');
    const [comments, setComments] = useState([]);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [currentPost, setCurrentPost] = useState([]);
    const [userFriends, setUserFriends] = useState([]);

    const {userObject, setUserObject} = useContext(UserContext);

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

    // fetch user timeline posts
    function fetchTimeline() {
        fetch(`https://qa7680-nodebook-api.onrender.com/users/${userObject.user}/timeline`, {
                    mode: 'cors', method: 'GET'
                })
                    .then(resTwo => resTwo.json())
                    .then(dataTwo => {                        
                        var arr = []
                        console.log(dataTwo);
                        dataTwo.posts.map((post) => {                            
                            const postArr = post;                            
                            postArr['showComments'] = false;
                            postArr['time'] = timeAgo(post.time);
                            if(post.author.profile_pic){
                                const blob = new Blob([Int8Array.from(post.author.profile_pic.data.data)], {type: post.author.profile_pic.contentType});
                                const image = window.URL.createObjectURL(blob); 
                                postArr['image'] = image;
                            }else{
                                postArr['image'] = (require('../images/egg.jpg'))
                            }
                            dataTwo.images.map((single_image) => {
                                if(single_image.post === post._id){
                                    const blob = new Blob([Int8Array.from(single_image.image.data.data)], {type: single_image.image.contentType});
                                    const image = window.URL.createObjectURL(blob); 
                                    postArr['post_image'] = image;
                                }
                            });                                                    
                            arr.push(postArr);
                        });
                        var comments = [];
                        dataTwo.comments.map((comment) => {
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
                        setTimelinePosts(arr);
                        setComments(comments);
                        setLoadingPosts(false);
                });
    };

    // fetch user friends
    const fetchUserFriends = () => {
        fetch(`https://qa7680-nodebook-api.onrender.com/users/${userObject.user}/friends`, {
            mode: 'cors', method: 'GET'
        })
            .then(res => res.json())
            .then(data => {
               const arr = [];
               data.friendsList.map((friend) => {
                    const single_friend = friend;
                    if(friend.profile_pic){
                        const blob = new Blob([Int8Array.from(friend.profile_pic.data.data)], {type: friend.profile_pic.contentType});
                        const image = window.URL.createObjectURL(blob);
                        single_friend['profile_image'] = image
                    }else{
                        single_friend['profile_image'] = require('../images/egg.jpg')
                    }
                    arr.push(single_friend)
               })
               setUserFriends(arr);
            });
    };
    console.log(userFriends);

    // get user once
    useEffect(() => {
        setLoadingUser(true);
        fetchUser();
        fetchUserFriends();        
    }, [])    

    // get posts
    useEffect(() => {            
           fetchTimeline();                  
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
        },500)
    };    

    // close/open modal
    const handleClose = () => {
        setShow(false);
    };
    const handleShow = () => {setShow(true);}

    // user submitted post
    // const handleSubmit = (time) => {
    //     setLoadingPosts(true);  
    //     setTimeout(() => {
    //         setPosted(!posted);        
    //     }, time)         
    // } 

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
        }else if(time === 'last month') {
            return 'last month'
        }
        else{
            return formatted[0].concat(formatted[1].charAt(0))
        };
    };

    // Like a post
    const likePost = (post) => {
        if (!post.likes.includes(userObject.user)) {
        fetch(`https://qa7680-nodebook-api.onrender.com/posts/${post._id}/like`, {
            mode: 'cors', method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
                userId: userObject.user
            })
        })
            .then(res => res.json())
            .then(data => console.log(data))

        setTimelinePosts(timelinePosts.map((single_post) => {
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
            fetch(`https://qa7680-nodebook-api.onrender.com/posts/${post._id}/unlike`, {
                mode: 'cors', method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({
                    userId: userObject.user
                })
            })
                .then(res => res.json())
                .then(data => console.log(data));

                setTimelinePosts(timelinePosts.map((single_post) => {
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
        fetch(`https://qa7680-nodebook-api.onrender.com/posts/${post._id}/comments` , {
            mode: 'cors', method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
                author: userObject.user,
                comment: commentField
            })
        })
            .then(res => res.json())
            .then(data => {
                console.log(data)
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
        setTimelinePosts(timelinePosts.map((single_post) => {
            if(post._id === single_post._id) {
                single_post.showComments = true;
            };
            return single_post;
        }))
    };

    // show less comments 
    const showLessComments = (post) => {
        setTimelinePosts(timelinePosts.map((single_post) => {
            if(post._id === single_post._id) {
                single_post.showComments = false;
            };
            return single_post;
        }));
    };    

    // handle submit post
    const handleSubmit = (postText, postImage, postId) => {
        const post = {
            author: {
                first_name: user.first_name, last_name: user.last_name, _id: userObject.user                 
            },
            _id: postId,
            image: userImg,
            likes_length: 0,
            likes: [],
            post: postText,
            showComments: false,
            time: timeAgo(new Date().toISOString()),
            post_image: postImage.file
        }
        const timelinePostsArr = timelinePosts.slice();
        timelinePostsArr.unshift(post);
        setTimelinePosts(timelinePostsArr);        
    }

    // Delete post
    const deletePost = (post) => {
        fetch(`https://qa7680-nodebook-api.onrender.com/posts/${post._id}`, {
        mode: 'cors', method: 'DELETE'
    })
        .then(res => res.json())
        .then(data => console.log({
        msg: 'Post deleted',
        post_info: data
        }));        
        const postsArr = timelinePosts.slice();
        for(let i = 0; i<postsArr.length; i++) {
            if(postsArr[i]._id === post._id){
                postsArr.splice(i,1)
            };
        }
        setTimelinePosts(postsArr);
        hideConfirmDeletePost();
    };
    const confirmDeletePost = (post) => {
        setConfirmDelete(true);
        setCurrentPost(post);                      
    };
    const hideConfirmDeletePost = () => {
        setConfirmDelete(false);
    };
    
    // delete comment
    const deleteComment = (comment) => {
        fetch(`https://qa7680-nodebook-api.onrender.com/comments/${comment._id}`, {
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
    
    return(
        <div style={{minHeight: "100vh"}}>
            {loadingUser ? <div style={{minHeight: 'inherit', display: 'flex', alignItems: 'center', 
            justifyContent: 'center'}}>
                <h3></h3>
                <Spinner animation = "border" />
            </div>
            :
            <div>
            {show && <PostModal show={show} handleClose={handleClose} user={user} handleSubmit={handleSubmit} 
            first_name={user.first_name}/>}
            <NavbarComponent userImage = {userImg} user={user} logout={logout}/>
            <div className="userDashMain" style={{width: '100%'}}>
                <div className="userDashLeft" style={{width: '33%', display: 'flex', flexDirection: 'column'}}>
                    <Link className="routeLinks leftDashLinks" to ={`/users/${userObject.user}`}><div className="userDashLeftItem">
                        <img src={userImg} style={{borderRadius: '50%', width: '40px', height: '40px', objectFit: 'cover'}}/>
                        {user.first_name} {user.last_name}
                    </div>
                    </Link>
                    <Link to = "/discover" className="routeLinks leftDashLinks">
                    <div className="userDashLeftItem">
                    <img src={require('../images/fb_group.png')} />
                    Find Friends
                    </div>
                    </Link>
                    <Link to = "#" className="routeLinks leftDashLinks">
                    <div className="userDashLeftItem">
                    <img src={require('../images/personal_blog.png')} />
                    Personal Blog
                    </div>
                    </Link>
                    <Link to = "#" className="routeLinks leftDashLinks">
                    <div className="userDashLeftItem">
                    <img src={require('../images/marketplace_2.png')} />
                    Marketplace
                    </div>
                    </Link>
                    <Link to = "#" className="routeLinks leftDashLinks">
                    <div className="userDashLeftItem">
                    <img src={require('../images/messenger_2.png')} />
                    Messenger
                    </div>
                    </Link>
                </div>
                <div className="userDashCenter" style={{width: '33%', display: 'flex', flexDirection: 'column', 
            alignItems: 'center', gap: '1rem'}}>
                    <div class="card" style={{border:'1px solid rgb(229, 231, 235)', borderRadius: '10px', width: '100%',
                padding: '0.6rem'}}>
                    <div class="card-body" style={{width: '100%'}}>
                        <div class="whatsOnMind" style={{display: 'flex', gap: '0.5rem'}}>
                        <Link to = {`/users/${userObject.user}`} className="routeLinks"><img src={userImg} style={{borderRadius: '50%', width: '40px', height: '40px',
                        objectFit: 'cover'}}/></Link>
                            <input onClick={handleShow}
                            class="whatsOnMindInput" placeholder={`What's on your mind, ${user.first_name}?`}/>
                        </div>
                        <hr class="horizontalLine"/>
                        <div class= "whatsOnMindIcons" style={{width: '100%'}}>
                            <div className="whatsOnMindIconsItems">
                            <FontAwesomeIcon icon={faVideo} style={{color: '#ff5c5c', width: '24px', height: '24px'}}/>
                            Live video
                            </div>
                            <div className="whatsOnMindIconsItems">
                            <FontAwesomeIcon icon={faImages} style={{color: '#32cd32', width: '24px', height: '24px'}}/>
                            Photos/Videos
                            </div>
                            <div className="whatsOnMindIconsItems">
                            <FontAwesomeIcon icon={faFaceSmile} style={{color: 'orange', width: '24px', height: '24px'}}/>
                            Feeling/Activity
                            </div>
                        </div>
                    </div>
                    </div>        
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
                        timelinePosts.map((post) => {
                            var commentsArr = [];
                            var comments_length = 0;
                            return (
                                <div class="card" style={{border:'1px solid rgb(229, 231, 235)', borderRadius: '10px', width: '100%',
                                padding: '0.6rem'}}>
                                 <div class="card-body" style={{width: '100%', display: 'flex', flexDirection: 'column'}}>
                                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                    <div style={{display: 'flex', gap: '0.6rem', alignItems: 'center'}}>
                                        <Link to = {`/users/${post.author._id}`} className="routeLinks">
                                            <img src={post.image} style={{borderRadius: '900%', width: '40px', height: '40px',
                                    objectFit: 'cover'}}/></Link>
                                        <div>
                                        <Link to = {`/users/${post.author._id}`} className="routeLinks">
                                            <p style={{margin: '0', fontWeight: 'bold', color: '#606266'
                                        }}>{post.author.first_name} {post.author.last_name}</p></Link>
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
                                    <Link to = {`/users/${userObject.user}`} className="routeLinks"><img src={userImg} style={{borderRadius: '50%', width: '30px', height: '30px', 
                                    objectFit: 'cover'}}/></Link>
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
                                                    <Link to = {`/users/${comment.author._id}`} className="routeLinks"><img src={comment.image} style={{borderRadius: '900%', width: '30px', height: '30px',
                                                objectFit: 'cover'}}/></Link>
                                                    <div style={{display: 'flex', flexDirection: 'column'}}>
                                                        <div className="postComment">
                                                        <Link to = {`/users/${comment.author._id}`} className="routeLinks">
                                                            <p style={{margin: '0', fontSize: '15px'}}>
                                                                <strong>{comment.author.first_name} {comment.author.last_name}</strong></p>
                                                        </Link>
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
                                                    <Link to = {`/users/${comment.author._id}`} className="routeLinks">
                                                        <img src={comment.image} style={{borderRadius: '900%', width: '30px', height: '30px',
                                                objectFit: 'cover'}}/>
                                                </Link>
                                                    <div style={{display: 'flex', flexDirection: 'column'}}>
                                                        <div className="postComment">
                                                        <Link to = {`/users/${comment.author._id}`} className="routeLinks">
                                                            <p style={{margin: '0', fontSize: '15px'}}>
                                                                <strong>{comment.author.first_name} {comment.author.last_name}</strong></p>
                                                        </Link>
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
                <div className="userDashRight" style={{width: '33%', display: 'flex', flexDirection: 'column', paddingTop: '1rem'}}> 
                    <p style={{color: '#65676b', fontFamily: 'arial', fontWeight: 'bold', fontSize: 'large',
                    paddingLeft: '61%'}}>Contacts</p>
                    <div width="100%" style={{paddingLeft: '60%', display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                    {
                        userFriends.slice(0,3).map((friend) => {
                            return(
                            <Link to = {`/users/${friend._id}`} className="routeLinks">
                            <div className="contactsItem">
                            <img src={friend.profile_image} style={{width: '32px', height: '32px', borderRadius: '50%',
                                objectFit: 'cover'}}/>
                            <p style={{margin: '0'}}>{friend.first_name} {friend.last_name}</p>
                            </div>
                            </Link>
                            )
                        })
                    }
                    </div>
                </div>
            </div>
            </div>
            }
        </div>
        
        )
};

export default UserDashboard;