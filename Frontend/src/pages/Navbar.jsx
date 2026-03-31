import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import RestoreIcon from '@mui/icons-material/Restore';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem("token");

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/auth");
    };

    return (
        <Box sx={{ flexGrow: 1, width: '100%', zIndex: 1100 }}>
            <AppBar position="static" color="transparent" elevation={0} sx={{ 
                bgcolor: 'rgba(54, 58, 60, 0.8)', 
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
                <Toolbar sx={{ justifyContent: 'space-between', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
                    
                    {/* Logo Area */}
                    <Typography 
                        variant="h5" 
                        component="div" 
                        sx={{ fontWeight: 'bold', color: 'white', cursor: 'pointer', letterSpacing: '2px' }}
                        onClick={() => navigate("/")}
                    >
                        WAVVY
                    </Typography>

                    {/* Navigation Links Area */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {token ? (
                            <>
                                {location.pathname !== "/home" && (
                                    <Button sx={{ color: 'white', textTransform: 'none', fontSize: '1rem' }} onClick={() => navigate("/home")}>
                                        Home
                                    </Button>
                                )}
                                {location.pathname !== "/history" && (
                                    <Button 
                                        sx={{ color: 'white', textTransform: 'none', fontSize: '1rem' }} 
                                        onClick={() => navigate('/history')}
                                        startIcon={<RestoreIcon />}
                                    >
                                        History
                                    </Button>
                                )}
                                <Button 
                                    variant="outlined" 
                                    sx={{ 
                                        color: 'white', 
                                        borderColor: 'rgba(255, 255, 255, 0.5)',
                                        textTransform: 'none', 
                                        fontSize: '1rem',
                                        '&:hover': {
                                            borderColor: 'white',
                                            bgcolor: 'rgba(255, 255, 255, 0.1)'
                                        }
                                    }} 
                                    onClick={handleLogout}
                                >
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button sx={{ color: 'white', textTransform: 'none', fontSize: '1rem' }} onClick={() => navigate("/Guest-Room")}>
                                    Join as Guest
                                </Button>
                                <Button sx={{ color: 'white', textTransform: 'none', fontSize: '1rem' }} onClick={() => navigate("/auth")}>
                                    Sign In
                                </Button>
                                <Button 
                                    variant="contained" 
                                    sx={{ 
                                        bgcolor: 'white', 
                                        color: 'black', 
                                        textTransform: 'none', 
                                        fontSize: '1rem',
                                        borderRadius: '20px',
                                        px: 3,
                                        '&:hover': {
                                            bgcolor: 'rgba(255, 255, 255, 0.8)'
                                        }
                                    }} 
                                    onClick={() => navigate("/auth")}
                                >
                                    Sign Up
                                </Button>
                            </>
                        )}
                    </Box>

                </Toolbar>
            </AppBar>
        </Box>
    );
};

export default Navbar;
