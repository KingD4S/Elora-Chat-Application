import React from 'react'

import { Route, Routes } from 'react-router'
import Home from './pages/Home.jsx'
import SignUpPage from './pages/SignUpPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import NotificationsPage from './pages/NotificationsPage.jsx'
import ChatPage from './pages/ChatPage.jsx'
import CallPage from './pages/CallPage.jsx'
import OnBoardingPage from './pages/OnBoardingPage.jsx'

import toast,{ Toaster } from 'react-hot-toast'

const App = () => {
  return (
    <div className='h-screen' data-theme='night'>
      <button onClick={() => toast.success('Radhe Radhe')}>Radhe Radhe</button>

      <Routes>
        <Route path="/" element ={<Home/>} />
        <Route path="/signup" element ={<SignUpPage/>} />
        <Route path="/login" element ={<LoginPage/>} />
        <Route path="/notifications" element ={<NotificationsPage/>} />
        <Route path="/chat" element ={<ChatPage/>} />
        <Route path="/call" element ={<CallPage/>} />
        <Route path="/onboarding" element ={<OnBoardingPage/>} />
      </Routes>
      <Toaster/>
    </div>
  )
}

export default App