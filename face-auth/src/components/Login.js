import React, { useState } from 'react';
import { Box, Button, Typography, CircularProgress, Input } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('facetosearch', file);

    try {
      const res = await fetch('/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.success) {
        const isStudent = data.externalImageId.startsWith('student_');
        const isTeacher = data.externalImageId.startsWith('teacher_');

        sessionStorage.setItem('authInfo', JSON.stringify(data));
        navigate(isStudent ? '/student' : isTeacher ? '/teacher' : '/');
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box textAlign="center" mt={8}>
      <Typography variant="h4" gutterBottom>
        Face Authentication Login
      </Typography>
      <form onSubmit={handleSubmit}>
        <Input type="file" onChange={(e) => setFile(e.target.files[0])} accept="image/*" required />
        <Box mt={2}>
          <Button variant="contained" type="submit" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Authenticate'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default Login;
