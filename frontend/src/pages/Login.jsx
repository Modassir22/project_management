import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Hexagon } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      alert('Login failed. Check your credentials.');
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100%', backgroundColor: 'var(--bg-primary)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
        <div className="d-flex flex-column align-center justify-center mb-4 text-center">
          <Hexagon size={40} color="var(--accent-color)" fill="var(--accent-color)" fillOpacity={0.2} style={{ marginBottom: '1rem' }} />
          <h2>Welcome back</h2>
          <p style={{ fontSize: '0.9rem' }}>Enter your credentials to access Nexus</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input type="email" required className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" required className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <button type="submit" className="btn btn-primary mt-2" style={{ width: '100%' }}>Sign In</button>
        </form>
        <p className="mt-4 text-center" style={{ fontSize: '0.85rem' }}>
          Don't have an account? <Link to="/signup" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
