import { Routes, Route } from 'react-router-dom'
import Landingpages from '../pages/Landingpages'
import Signup from '../pages/Signup'
import Signin from '../pages/Signin'
import Error404 from '../pages/Error404'
import Dashboard from '../pages/Dashboard'
import Vote from '../pages/Vote'
import Logout from '../pages/Logout'
import CreatePoll from '../pages/CreatePoll'
import EditPoll from '../pages/EditPoll'
import MyPolls from '../pages/MyPolls'
import Results from '../pages/Results'
import Profile from '../pages/Profile'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landingpages />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="*" element={<Error404 />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/vote" element={<Vote />} />
        <Route path="/results" element={<Results />} />
        <Route path="/create-poll" element={<CreatePoll />} />
        <Route path="/edit-poll" element={<EditPoll />} />
        <Route path="/mypolls" element={<MyPolls />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/logout" element={<Logout />} />
        </Routes>
    </>
  )
}

export default App
