import React, { useState } from 'react';
import { Analytics } from "@vercel/analytics/react"
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AboutUsPage from './pages/About';
import MusicGenerator from './pages/Musicgen';
import PromptSelector from './pages/test';
import RefrshHandler from './components/RefrshHandler';
import Instruments from './pages/Instruments';
import { DrumPlayer } from './pages/DrumPlayer.jsx';
import { KeyboardPlayer } from './pages/KeyboardPlay';
import HandDrum from './pages/VirtualDrums';
import Dashboard from './pages/Dashboard';
import { SettingsProvider } from './components/SettingContext.jsx';
import Beatboxer from './pages/beatsq.jsx';
import Home from './pages/home_temp.jsx';
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const PrivateRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/login" />;
  };

  return (
    <div className="App">
      <RefrshHandler setIsAuthenticated={setIsAuthenticated} />
      <SettingsProvider>
        <Routes>
          <Route path='/' element={<Navigate to='/login' />} />
          <Route path='/login' element={<Login />} />
          <Route path='/Signup' element={<Signup />} />
          <Route path='/instrument' element={<Instruments />} />
          <Route path='/home' element={<PrivateRoute element={<Home />} />} />
          <Route path='/Music-Gen' element={<MusicGenerator />} />
          <Route path='/test' element={<PromptSelector />} />
          <Route path='/drums' element={<DrumPlayer />} />
          <Route path='/piano' element={<KeyboardPlayer />} />
          <Route path='/about' element={<AboutUsPage/>} />
          <Route path='/virtualdrums' element={<HandDrum />} />
           <Route path='/saved' element={<Dashboard />} />
           <Route path='/beatsequencer' element={<Beatboxer />} />

        </Routes>
      </SettingsProvider>
    </div>
  );
}

export default App;
