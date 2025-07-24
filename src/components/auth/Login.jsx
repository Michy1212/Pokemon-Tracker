import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { currentUser, loginWithGoogle, loginWithEmail, register, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegistering) {
        await register(email, password, username);
      } else {
        await loginWithEmail(email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      {currentUser ? (
        <div className="logged-in-buttons">
            <button 
              onClick={() => navigate('/')} 
              className="home-btn"
            >
              Aller à l'accueil
            </button>
            <button onClick={logout} className="logout-btn">
              Se déconnecter
            </button>
        </div>
      ) : (
        <div className="login-form">
          <h2>{isRegistering ? 'Inscription' : 'Connexion'}</h2>
          {error && <p className="error-message">{error}</p>}
          
          <form onSubmit={handleSubmit}>
            {isRegistering && (
              <div className="form-group">
                <label>Pseudo:</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Mot de passe:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="6"
              />
            </div>
            <button type="submit" className="submit-btn">
              {isRegistering ? "S'inscrire" : "Se connecter"}
            </button>
          </form>

          <button onClick={handleGoogleLogin} className="google-btn">
            Se connecter avec Google
          </button>

          <p className="toggle-mode">
            {isRegistering ? (
              <>
                Déjà un compte?{' '}
                <span onClick={() => setIsRegistering(false)}>Se connecter</span>
              </>
            ) : (
              <>
                Pas de compte?{' '}
                <span onClick={() => setIsRegistering(true)}>S'inscrire</span>
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}