import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Hexagon } from 'lucide-react';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Member');
  const { register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password, role);
      navigate('/');
    } catch (err) {
      alert('Signup failed. Email might be in use.');
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100%', backgroundColor: 'var(--bg-primary)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
        <div className="d-flex flex-column align-center justify-center mb-4 text-center">
          <Hexagon size={40} color="var(--accent-color)" fill="var(--accent-color)" fillOpacity={0.2} style={{ marginBottom: '1rem' }} />
          <h2>Create an account</h2>
          <p style={{ fontSize: '0.9rem' }}>Start managing projects efficiently</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" required className="form-control" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
          </div>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input type="email" required className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" required className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <div className="form-group">
            <label className="form-label">Account Role</label>
            <select className="form-control" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="Member">Member</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary mt-2" style={{ width: '100%' }}>Sign Up</button>
        </form>
        <p className="mt-4 text-center" style={{ fontSize: '0.85rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
