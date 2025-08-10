import * as React from 'react';
import {
  Avatar, Button, CssBaseline, TextField, Link, Paper,
  Box, Grid,
  Snackbar,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../contexts/AuthContext';

const defaultTheme = createTheme();

export default function Authentication() {
  const [name, setName] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [formstate, setFormstate] = React.useState(0); // 0: Sign In, 1: Sign Up
  const [message, setMessage] = React.useState('');
  const [open,setOpen] = React.useState(false);
  const [error,setError] = React.useState('');

const {handleRegister , handleLogin} = React.useContext(AuthContext);

  let handleAuth = async (e)=>{
    e.preventDefault();
    try{
      if(formstate === 0){
        let result  = await handleLogin(username,password);
      }
      if(formstate === 1){
        let result =  await handleRegister(name,username,password);
        setMessage(result);
        setError('')
        setOpen(true);
        setName('');
        setUsername('');
        setPassword('');
        setFormstate(0)
      }
    }catch(err){
      let message = (err.response.data.message);
      setError(message);
    }
  }

  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid
        container
        component="main"
        sx={{
          height: '100vh',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f5f5f5',
        }}
      >
        <CssBaseline />
        <Grid
          item
          xs={11}
          sm={8}
          md={5}
          component={Paper}
          elevation={6}
          square
          sx={{
            borderRadius: 2,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: 4,
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: 400,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Button
                variant={formstate === 0 ? 'contained' : 'outlined'}
                onClick={() => setFormstate(0)}
              >
                Sign In
              </Button>
              <Button
                variant={formstate === 1 ? 'contained' : 'outlined'}
                onClick={() => setFormstate(1)}
              >
                Sign Up
              </Button>
            </Box>

            <Box component="form" noValidate sx={{ width: '100%' }}>
              {/* Always rendered, visibility toggled */}
              <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Full Name"
                name="name"
                value={name}
                autoComplete="name"

                onChange={(e) => setName(e.target.value)}
                sx={{
                  visibility: formstate === 1 ? 'visible' : 'hidden',
                  height: formstate === 1 ? 'auto' : 0,
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                value={username}
                autoComplete="username"
                autoFocus={formstate === 0}
                onChange={(e) => setUsername(e.target.value)}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                value={password}
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
              />

              <p style={{color:"red"}}>{error}</p>

              <Button
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick={handleAuth}
              >
                {formstate === 0 ? 'Sign In' : 'Sign Up'}
              </Button>

              <Grid container justifyContent="flex-end">
                <Grid item>
                  <Link
                    href="#"
                    variant="body2"
                    onClick={() => setFormstate((prev) => (prev === 0 ? 1 : 0))}
                  >
                    {formstate === 0
                      ? "Don't have an account? Sign Up"
                      : "Already have an account? Sign In"}
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Grid>
      </Grid>

<Snackbar
  open={open}
  autoHideDuration={4000}
  onClose={() => setOpen(false)}
  message={message}
/>

    </ThemeProvider>
  );
}
