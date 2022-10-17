import { Link } from "react-router-dom";
import { useState, useContext } from "react";
import UserDashboard from './UserDashboard';
import { UserContext } from "../UserContext";
import { useNavigate } from "react-router-dom";
import imageCompression from 'browser-image-compression';
import { FacebookLoginButton } from "react-social-login-buttons";

const Home = () => {

    const [emailField, setEmailField] = useState('');
    const [passField, setPassField] = useState('');
    const [signEmail, setSignEmail] = useState('');
    const [signFirstName, setSignFirstName] = useState('');
    const [signLastName, setSignLastName] = useState('');
    const [signPassword, setSignPassword] = useState('');
    const [signConfirmPassword, setSignConfirmPassword] = useState('');
    const [showSignUp, setShowSignUp] = useState(false);
    const [dob, setDob] = useState('');
    const [profilePic, setProfilePic] = useState(false);
    const [errorMsg, setErrorMsg] = useState(false);
    const [signupError, setSignupError] = useState([]);
    const [signupSuccess, setSignupSuccess] = useState('');

    const {userObject, setUserObject} = useContext(UserContext);
    
    // Login handle
    const loginUser = (e) => {
        setErrorMsg(false);
        e.preventDefault();
            fetch('http://localhost:8000/login', {
            method: 'POST', mode: 'cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
                email: emailField,
                password: passField
            })
        })
            .then(res => res.json())
            .then(data => {                
                if(data.user !== false){
                    const user_id_token = {
                        user: data.user._id,
                        token: data.token
                    }
                    localStorage.setItem('user', JSON.stringify(user_id_token));
                    setUserObject(JSON.parse(localStorage.getItem('user')));
                    setEmailField('');
                    setPassField('');
                    setErrorMsg(false);
                    setSignEmail('');
                    setSignFirstName('');
                    setSignLastName('');
                    setSignPassword('');
                    setSignConfirmPassword('');
                    setDob('');
                    setSignupError([]);
                }
                if(data.error) { setErrorMsg(data.error.message) };
            });        
    };

    // guest login
    function guestLogin(e) {
        setErrorMsg(false);
        setEmailField('usertest@mail.com');
        setPassField('password');
        setTimeout(() => {
        fetch('http://localhost:8000/login', {
            method: 'POST', mode: 'cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
                email: 'usertest@mail.com',
                password: 'password'
            })
        })
            .then(res => res.json())
            .then(data => {
                const user_id_token = {
                    user: data.user._id,
                    token: data.token
                }
                localStorage.setItem('user', JSON.stringify(user_id_token));
                setUserObject(JSON.parse(localStorage.getItem('user')));
                setEmailField('');
                setPassField('');
                setSignEmail('');
                setSignFirstName('');
                setSignLastName('');
                setSignPassword('');
                setSignConfirmPassword('');
                setDob('');   
                setSignupError([]);             
            });
        }, 500)
    };

    // Sign up handle
    const registerUser = (e) => {
        e.preventDefault();

        setSignupSuccess(false);
        setSignupError([]);

        const form = new FormData();
        form.append('email', signEmail);
        form.append('first_name', signFirstName);
        form.append('last_name', signLastName);
        form.append('password', signPassword);
        form.append('confirm_password', signConfirmPassword);
        form.append('dob', dob);
        form.append('image', profilePic);

        if(profilePic===false || profilePic===undefined){
            fetch('http://localhost:8000/signup/noimage', {
            method: 'POST', mode: 'cors', body: form , headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
                email: signEmail,
                first_name: signFirstName,
                last_name: signLastName,
                password: signPassword,
                confirm_password: signConfirmPassword,
                dob: dob
            })
        })
            .then(res => res.json())
            .then(data => {
                if(data.emailError){
                    setSignupError([{msg: data.emailError}])
                }else if(data.errors) { 
                    setSignupError(data.errors)
                }else{
                    setSignEmail('');
                    setSignFirstName('');
                    setSignLastName('');
                    setSignPassword('');
                    setSignConfirmPassword('');
                    setDob('');
                    setSignupSuccess(data.success_message)
                }
            })    
            
        }else{
            fetch('http://localhost:8000/signup', {
            method: 'POST', mode: 'cors', body: form
        })
            .then(res => res.json())
            .then(data => {
                if(data.emailError){
                    setSignupError([{msg: data.emailError}])
                }else if(data.errors) {
                    setSignupError(data.errors)
                }else{
                    setSignEmail('');
                    setSignFirstName('');
                    setSignLastName('');
                    setSignPassword('');
                    setSignConfirmPassword('');
                    setDob('');
                    setSignupSuccess(data.success_message)
                }
            })
        }        
    };    

    // handle image
    function handleImageUpload(e) {               
        const imageFile = e.target.files[0];        
        const options = {
            maxSizeMB: 0.05,
            maxWidthOrHeight: 1920,
            useWebWorker: true
        }
        imageCompression(imageFile, options)
            .then((file) => {
                setProfilePic(file);
            })               
    };    
    

    return(
        <div class = "homeMain" style={{minHeight: "inherit", backgroundColor: '#f0f2f5'}}>
            {
                userObject ? <div style={{height: "inherit"}}><UserDashboard /> </div>
                :
        <div class = "homeMain" style={{minHeight: "inherit", display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#f0f2f5', paddingBottom: '5rem', gap: '7rem'}}>
            <div class = "hmLeft" style={{display: 'flex', flexDirection: 'column', maxWidth: '37vw'}}>
                    <h1 class="text-primary fw-bolder">nodebook</h1>
                    <p class="fs-3" style={{maxWidth: '26vw'}}>Nodebook helps you connect and share with the people in your life.</p>
                </div>
            <div class = "card" style={{boxShadow:'0 2px 4px rgb(0 0 0 / 10%), 0 8px 16px rgb(0 0 0 / 10%)', border: 'none',
        minWidth: '25vw'}}>
            {showSignUp ? 
                <div class="card-body" style={{gap: '1rem', padding: '2rem',display: 'flex', flexDirection: 'column', borderRadius: '6px'}}> 
                    <form onSubmit={registerUser}>
                        <div class="mb-3"><input name = "email" id = "email" type="email" placeholder="Email address" required="true"
                        class="form-control form-control-lg" value={signEmail} onChange={(e) => {setSignEmail(e.target.value)}}/></div>
                        <div class="mb-3"><input name = "first_name" id = "first_name" type="text" placeholder="First Name" required="true"
                        class="form-control form-control-lg" value={signFirstName} onChange={(e) => {setSignFirstName(e.target.value)}}/></div>
                        <div class="mb-3"><input name = "last_name" id = "last_name" type="text" placeholder="Last Name" required="true"
                        class="form-control form-control-lg" value={signLastName} onChange={(e) => {setSignLastName(e.target.value)}}/></div>
                        <div class="mb-3"><input name = "password" id = "password" type="password" placeholder="Password" required="true"
                        class="form-control form-control-lg" value={signPassword} onChange={(e) => {setSignPassword(e.target.value)}}/></div>
                        <div class="mb-3"><input name = "confirm_password" id = "confirm_password" type="password" placeholder="Confirm Password" required="true"
                        class="form-control form-control-lg" value={signConfirmPassword} onChange={(e) => {setSignConfirmPassword(e.target.value)}}/></div>
                        <div class="mb-3">
                            <label for = "signUpImage" className="signUpImgLabel">Profile Picture(optional):&nbsp;</label>
                            <input id="signUpImage" className="signUpImageInput"
                            name = "image" onChange={(e) => {handleImageUpload(e)}} type="file" accept="image/png, image/jpeg, image/jpg"/>
                        </div>
                        <div class="mb-3" style={{display: 'flex', alignItems: 'center', gap: '0.2rem'}}>
                            <label style={{width: '30%'}} class="fs-5" for = "date_of_birth" id = "date_of_birth">Date of birth: </label>
                            <input style={{width: '70%'}} name = "date_of_birth" id = "date_of_birth" type="date" required="true"
                        class="form-control form-control-lg" value={dob} onChange={(e) => setDob(e.target.value)}/></div>
                        {
                            signupError.length>0 &&
                            signupError.slice(0,1).map((error) => {
                                return (
                                    <div class="alert alert-danger" role="alert" style={{ fontWeight: 'bold', maxWidth: '100%' }}>
                                        <p style={{margin:'0', maxWidth: '20vw'}}>{error.msg}</p>
                                    </div>
                                )
                            })                           
                        }
                        {
                            signupSuccess && <div class="alert alert-success" role="alert" style={{ fontWeight: 'bold' }}>
                                <p style={{margin:'0', maxWidth: '20vw'}}>{signupSuccess}</p>
                         </div>
                        }  
                        <button class="btn btn-warning fw-bold btn-lg" type="submit"
                        style={{width: '100%'}}>Sign Up!</button>
                    </form>
                    <button class="btn btn-primary fw-bold btn-lg" type="button"
                        style={{width: '100%'}} onClick={ () => setShowSignUp(false) }>Log in</button>
                </div>
                :
                <div class="card-body" style={{gap: '0.65rem', padding: '2rem',display: 'flex', flexDirection: 'column', borderRadius: '6px'}}>
                    <form onSubmit={loginUser}>
                        <div class="mb-3"><input name = "email" id = "email" type="email" placeholder="Email address" required="true"
                        class="form-control form-control-lg" value={emailField} onChange={(e) => setEmailField(e.target.value)}/></div>
                        <div class="mb-3"><input name = "password" id = "password" type="password" placeholder="Password" required="true"
                        class="form-control form-control-lg" value={passField} onChange={(e) => setPassField(e.target.value)}/></div>
                        {
                            errorMsg && <div class="alert alert-danger" role="alert" style={{ fontWeight: 'bold' }}>
                               <p style={{margin:'0', maxWidth: '23vw'}}>{errorMsg}</p>
                            </div>
                        }                        
                        <button class="btn btn-primary fw-bold btn-lg" type="submit"
                        style={{width: '100%'}}>Log in</button>
                    </form>
                    <button style={{width: '100%', lineHeight: '1.8rem'}}
                    class="btn btn-warning fw-bold " onClick={() => {setEmailField('');setPassField('');setShowSignUp(true)}}>Create New Account</button>
                    <button onClick={guestLogin} class="btn btn-secondary fw-bold " type="button"
                    style={{width: '100%', lineHeight: '1.8rem'}}>Log in as a Guest</button>                    
                </div>
                }
            </div>
        </div>
        }
        </div>
    );
};

export default Home;