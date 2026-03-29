import logo from './logo.svg';
import './App.css';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Card from '@mui/material/Card';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

function App() {
  return (
    <div className="App">
      <CssBaseline />
      <Container maxWidth="false" sx={{ px: 0 }}>
        <Box sx={{ bgcolor: '#cfe8fc',
            height: '100vh',
            display: 'flex',
            flexDirection:'column',
            //justifyContent: 'center',
            alignItems: 'center'}} 
        >
        <AppBar position="static" sx={{display:'flex',justifyContent:'center',padding:'30px'}}>
          <Toolbar variant="dense" sx={{textAlign:'center'}}>
            <Typography variant="h6" color="inherit" component="div" >
              Short URL by Absalom
            </Typography>
          </Toolbar>
        </AppBar>
        <Card sx={{ minWidth: 275,
          padding:'50px', 
          width: '70%' }}>
          <h1>Paste the URL to be shortened</h1>
          <div style={{display:'flex',justifyContent:'center'}}>
            <TextField fullWidth label="Enter the link here" id="fullWidth" />
            <Button variant="contained">Shorten URL</Button>
          </div>
            
        </Card>
        </Box>
      </Container>
    </div>
  );
}

export default App;
