import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
// import './App.css'
import { Routes, Route } from 'react-router-dom'
import Landingpages from '../pages/Landingpages'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Routes>
        <Route path="/" element={<Landingpages />} />
        </Routes>
    </>
  )
}

export default App
