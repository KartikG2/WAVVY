import React from 'react';
import { Link } from 'react-router-dom';
import "../App.css"
import Navbar from './Navbar';

const LandingPage = () => {
  return (
    <div className='landingPageContainer'>
        <Navbar />

        <div className="landingMainContainer">
            <div className='landingPage-hero-container'>
                <h1>Connect with your loved ones</h1>
                <p>Cover a distance by WAVVY...</p>

                <div role='button' className='getStartedBtn'>
                    <Link to={"/home"}>Get Started</Link>
                </div>
            </div>

            <div className='heroImage'>
                <img src="/grid.jpg" alt="mobiles" />
            </div>
        </div>

        <footer>
            <div className='leftFooter'>
                <p>WAVVY</p>
            </div>
            <div className='rightFooter'>
                <div className='divContainer'><Link className='links' to={"/home"}>Home</Link></div>
                <div className='divContainer'><Link className='links' to={"https://www.linkedin.com/in/kartikgangavati/"}>Linked In</Link></div>
                <div className='divContainer'><Link className='links' to={"https://github.com/KartikG2"}>Github</Link></div>
                <div className='divContainer'><Link to={"/guest-room"}>Join as Guest</Link></div>
                <div className='divContainer'><Link className='links'to={"/auth"}>SignUp</Link></div>
                <div className='divContainer'><Link className='links'to={"/auth"}>SignIn</Link></div>
            </div>
        </footer>

    </div>

  )
}

export default LandingPage;