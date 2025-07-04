import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Student from './components/Student';
import Teacher from './components/Teacher';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/student" element={<RequireAuth><Student /></RequireAuth>} />
        <Route path="/teacher" element={<RequireAuth><Teacher /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

const RequireAuth = ({ children }) => {
  const authInfo = sessionStorage.getItem('authInfo');
  return authInfo ? children : <Navigate to="/" replace />;
};

export default AppRoutes;
