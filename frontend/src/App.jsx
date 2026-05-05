import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ProjectDetails from './pages/ProjectDetails';
import Projects from './pages/Projects';
import Assessments from './pages/Assessments';
import './index.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  return user ? children : <Navigate to="/login" />;
};

const AppLayout = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <>{children}</>;
  }
  
  return (
    <div className="app-container">
      <Navbar />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/projects" element={<PrivateRoute><Projects /></PrivateRoute>} />
            <Route path="/project/:id" element={<PrivateRoute><ProjectDetails /></PrivateRoute>} />
            <Route path="/assessments" element={<PrivateRoute><Assessments /></PrivateRoute>} />
          </Routes>
        </AppLayout>
      </Router>
    </AuthProvider>
  );
}

export default App;
