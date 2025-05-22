import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
// import './App.css'
import { Routes, Route } from 'react-router-dom'
import Landingpages from '../pages/Landingpages'
import Signup from '../pages/Signup'
import Signin from '../pages/Signin'
import Error404 from '../pages/Error404'
import Dashboard from '../pages/Dashboard'
import Vote from '../pages/Vote'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Routes>
        <Route path="/" element={<Landingpages />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="*" element={<Error404 />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/Vote" element={<Vote />} />
        </Routes>
    </>
  )
}

export default App
