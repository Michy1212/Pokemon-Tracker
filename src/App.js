import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HuntList from './components/hunts/HuntList';
import PokemonGrid from './components/pokemon/PokemonGrid';
import CreateHunt from './components/hunts/CreateHunt';
import JoinPrivateHunt from './components/hunts/JoinPrivateHunt';
import './styles/main.css';
import Login from './components/auth/Login';
import Profile from './components/auth/Profile';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<HuntList />} />
          <Route path="/hunt/:huntId" element={<PokemonGrid />} />
          <Route path="/hunt/new" element={<CreateHunt />} />
          <Route path="/join-private" element={<JoinPrivateHunt />} />
          <Route path="/join-private/:huntId" element={<JoinPrivateHunt />} />
		  <Route path="/profile" element={<Profile />} />
		</Routes>
      </div>
    </Router>
  );
}

export default App;