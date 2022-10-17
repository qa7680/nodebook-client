import { Link } from "react-router-dom";

const EmptyContacts = () => {
    return (                
        <div class="d-flex align-items-center justify-content-center emptyContacts">
            <div class="text-center row">
                <div class=" col-md-6">
                    <img src= {require('../images/friends.jpg')} alt=""
                        class="img-fluid emptyContactsImg" />
                </div>
                <div class=" col-md-6 mt-5">                    
                    <p class="lead" style={{paddingBottom: '1rem'}}>
                        Your contacts list is currently empty.
                    </p>
                    <a href="/discover" class="emptyContactsImgBtn">Discover new friends!</a>
                </div>
            </div>
        </div>        
    )
};

export default EmptyContacts;