import React, { Fragment, useState, useEffect } from 'react';
import { Dialog, DialogTitle, TextField, Button, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

// Google OAuth Login Button
const GoogleLoginButton = () => {
  const handleGoogleLogin = () => {
    window.location.href = '/auth/google';
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    
    if (token) {
      localStorage.setItem('jwtToken', token);

      setTimeout(() => {
        window.location.href = '/'; 
      }, 500); 
    }
  }, []);

  return (
    <Button variant='contained' color='primary' onClick={handleGoogleLogin}>
      Login with Google
    </Button>
  );
};

// Main AuthModal Component
export default function AuthModal({ open, close, isRegisterMode, toggleRegister }) {
  const { login, register } = useAuth();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const clickSubmit = async () => {
    setLoading(true);
    setError('');

    // Validate email 
    if (!validateEmail(formData['username'])) {
      setError('Please enter a valid email');
      setLoading(false);
      return;
    }

    try {
      isRegisterMode ? await register(formData) : await login(formData);
      close();
    } catch (error) {
      setError(error.message || 'An error occurred');
    }

    setLoading(false);
  };

  const disabledLoginButton = !formData['username'] || !formData['password'];
  const disabledRegisterButton = !formData['username'] || !formData['password'];

  return (
    <Dialog open={open} onClose={close}>
      <DialogTitle>{isRegisterMode ? 'Register' : 'Login'}</DialogTitle>

      {isRegisterMode ? (
        <RegisterForm formData={formData} handleChange={handleChange} />
      ) : (
        <LoginForm formData={formData} handleChange={handleChange} />
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {loading ? (
        <center>
          <CircularProgress color='inherit' />
        </center>
      ) : (
        <Button
          onClick={clickSubmit}
          disabled={isRegisterMode ? disabledRegisterButton : disabledLoginButton}
          variant='contained'
          color='primary'>
          {isRegisterMode ? 'Register' : 'Login'}
        </Button>
      )}

      <Button onClick={toggleRegister}>
        {isRegisterMode ? 'I already have an account' : "I don't have an account"}
      </Button>

      <hr />

      {/* Google OAuth Login */}
      <GoogleLoginButton />
    </Dialog>
  );
}

// LoginForm Component
function LoginForm({ formData, handleChange }) {
  return (
    <Fragment>
      <TextField
        label='Username'
        name='username'
        type='text'
        value={formData['username'] || ''}
        onChange={handleChange}
        variant='filled'
        sx={{ mx: 2, my: 0.5 }}
        required
      />
      <TextField
        label='Password'
        name='password'
        type='password'
        value={formData['password'] || ''}
        onChange={handleChange}
        variant='filled'
        sx={{ mx: 2, my: 0.5 }}
        required
      />
    </Fragment>
  );
}

// RegisterForm Component
function RegisterForm({ formData, handleChange }) {
  return (
    <Fragment>
      <TextField
        label='Username'
        name='username'
        type='text'
        value={formData['username'] || ''}
        onChange={handleChange}
        variant='filled'
        sx={{ mx: 2, my: 0.5 }}
        required
      />
      <TextField
        label='Password'
        name='password'
        type='password'
        value={formData['password'] || ''}
        onChange={handleChange}
        variant='filled'
        sx={{ mx: 2, my: 0.5 }}
        required
      />
    </Fragment>
  );
}
