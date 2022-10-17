import { useContext, useEffect, useRef, useState } from "react";
import { Button } from "react-bootstrap";
import { Modal } from "react-bootstrap";
import "../styling/userdash.css";
import { UserContext } from "../UserContext";
import imageCompression from 'browser-image-compression';

const PostModal = ({show, handleClose, handleSubmit, first_name}) => {

    const [postText, setPostText] = useState('');
    const [postImage, setPostImage] = useState({
        file:null,
        post_image: null
    });
    const [required, setRequired] = useState(true);
    const [photoCopy, setPhotoCopy] = useState({
        file:null,
        post_image: null
    });    

    const {userObject, setUserObject} = useContext(UserContext);

    const textareaFocus = useRef(null);

    useEffect(() => {
        if(textareaFocus.current) {
            textareaFocus.current.focus();
        }
    }, []);

    // add a post with an optional image
    const addPost = (e) => {
        e.preventDefault();        
        fetch('https://cryptic-earth-09230.herokuapp.com/posts', {
            mode: 'cors', method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
                post: postText,
                author: userObject.user
            })
        })
            .then(res => res.json())
            .then(data => {           

                const form = new FormData();
                form.append('image', postImage.post_image)
                form.append('postId', data.post._id)
                
                if(postImage.file !== null) {
                fetch(`https://cryptic-earth-09230.herokuapp.com/users/${userObject.user}/image/post`, {
                    mode: 'cors', method: 'POST', body: form
                })
                    .then(resTwo => resTwo.json())
                    .then(dataTwo => {
                        console.log(data);                                                
                    })
                }                
                handleClose();
            // if(postImage.file !== null && postImage.post_image.type === "image/gif"){
            //     handleSubmit(2000);
            // }else{
            //     handleSubmit(0);
            // }
                handleSubmit(postText, postImage, data.post._id); 
            }
            )                                                   
    };
    

    // handle photos/image change
    const handleImage = (e) => {         
        // console.log(e.target);
        // if(postImage.file === null && postImage.post_image === null){
        //     setPhotoCopy({
        //         file: window.URL.createObjectURL(
        //             new Blob([e.target.files[0]], {
        //             type: "image/png", 
        //         })
        //         ),
        //         post_image: e.target.files[0]
        //     })
        // }              
        // if( e.target.files[0] === undefined){
        //     setPostImage(photoCopy);
        // }else{
        const imageFile = e.target.files[0];        
        const options = {
            maxSizeMB: 0.05,
            maxWidthOrHeight: 1920,
            useWebWorker: true
        }
        imageCompression(imageFile, options)
            .then((compressedImage) => {
                setPostImage({
                    file: window.URL.createObjectURL(
                        new Blob([imageFile], {
                        type: "image/png", 
                    })
                    ),
                    post_image: compressedImage
                });
            })            
        // }
        setRequired(false);        
    };        

     // remove image
     const removeImage = () => {    
        URL.revokeObjectURL(postImage.file);
        setPostImage({
            file: null,
            post_image: null
        });                
        // setPhotoCopy({
        //     file:null,
        //     post_image: null
        // })        
        setRequired(true);
    };            
    
    return(
        <Modal style={{overflowY: 'auto'}} show={show} onHide={handleClose} animation={false} centered>
            <Modal.Header closeButton>
                <Modal.Title>Create a Post!</Modal.Title>
            </Modal.Header>
            <form onSubmit={addPost}>
            <Modal.Body>
                <textarea className="textAreaPost" placeholder={`What's on your mind, ${first_name}`}
                ref={textareaFocus} onChange={(e) => setPostText(e.target.value)} required={required}/>                    
            </Modal.Body>
            <Modal.Footer style={{display: 'flex', justifyContent: 'center'}}>
                <label for = "addPhotosVideosBtn" className="addPhotosVideosBtnLabel">
                    Add Photo
                </label>                        
                <input id="addPhotosVideosBtn" className="addPhotosVideosBtn" placeholder="Add Photos/Videos" type="file" 
                onChange={(e) => {handleImage(e)}} value={""} accept="image/png, image/jpeg, image/jpg"/>
                <button className="uploadBtn" onClick={handleClose}>Upload</button>
                <button className="postBtn" type="submit">Post</button>                            
                {
                    (postImage.file !== null && postImage.post_image !== undefined) && <div className="imagepreviewContainer">
                        <img className="imagePreviewPost" src={postImage.file} /> 
                    <button onClick={removeImage} className="removePhoto btn btn-dark">
                        Remove Photo</button></div>
                }                
            </Modal.Footer>
            </form>
        </Modal>
    );
};

export default PostModal;