import React, { useState } from 'react';
import MapboxContainer from './components/MapboxContainer';
import LoginPage from './components/LoginPage';
//import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  // State to track if the user is logged in
  const [loggedIn, setLoggedIn] = useState(false);

  // Function to handle successful login
  const handleLogin = (email, password) => {
    // For simplicity, we're assuming login is successful here
    // In a real application, you'd validate login credentials with an API
    console.log('Logged in:', { email, password });
    
    // You could validate here before setting loggedIn to true
    if (email === 'admin' && password === 'admin') {
      setLoggedIn(true);
    } else {
      alert("Invalid login credentials. Please try again.");
    }
  };

  return (
    <div className="App">
      {loggedIn ? (
        // Show MapboxContainer if the user is logged in
        <MapboxContainer />
      ) : (
        // Show LoginPage if the user is not logged in
        <LoginPage onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
