import React from 'react'
import Navbar from '../component/Navbar'
import Poll from '../component/Poll'
import './Landingpages.css';
import Features from '../component/Features';
import Footer from '../component/Footer';

const Landingpages = () => {
  return (
    <>

<div className="poll">
    <Navbar />

    <Poll />
    <Features />
    <Footer />
    
    </div>
    </>
  )
}

export default Landingpages