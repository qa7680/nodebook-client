import { useState } from 'react';
import { BrowserRouter, Routes, Route} from 'react-router-dom';
import Home from './components/Home';
import UserDashboard from './components/UserDashboard';
import { UserContext } from './UserContext';
import FindFriends from './components/FindFriends';
import Friends from './components/Friends';
import UserProfile from './components/UserProfile';
import Settings from './components/Settings';
import ErrorPage from './components/404';

const RouteSwitch = () => {
 
    const [userObject, setUserObject] = useState(JSON.parse(localStorage.getItem('user')));

    return(        
            <body style={{fontFamily: 'helvetica', minHeight: '100vh', backgroundColor: '#f0f2f5'}}>
                    <BrowserRouter>
                    <UserContext.Provider value = { {userObject, setUserObject} }>
                        <Routes>
                            <Route path = "/" element = { <Home /> } />
                            <Route path = "/discover" element = { <FindFriends /> } />
                            <Route path = "/friends" element = { <Friends /> } />                            
                            <Route path = "/users/:userId" element = { <UserProfile /> } /> 
                            <Route path = "/settings" element = { <Settings /> } />     
                            <Route path = "*" element = { <ErrorPage /> } />                            
                        </Routes>
                    </UserContext.Provider>
                    </BrowserRouter>
            </body>        
    );
};

export default RouteSwitch;