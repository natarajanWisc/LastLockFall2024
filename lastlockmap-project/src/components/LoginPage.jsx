import React, { useState } from "react";
import styles from './LoginPage.module.css';
import BackgroundImage from "../assets/MadisonBackground.png";
import Logo from "../assets/logo.png";

const LoginPage = ({ onLogin }) => {
  const [inputUsername, setInputUsername] = useState(""); // State variable for username
  const [inputPassword, setInputPassword] = useState(""); // State variable for password
  const [loading, setLoading] = useState(false); // State variable for page loading

  // Handle login submit
  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);

    // Simulate login
    setTimeout(() => {
      onLogin(inputUsername, inputPassword);
      setLoading(false);
    }, 500);
  };

  return (
    <div
      className={styles.wrapper}
      style={{
        backgroundImage: `url(${BackgroundImage})`,
      }}
    >
      
      <div className={styles.container}>
        <div className={styles.logoContainer}>
          <img src={Logo} alt="Logo" className={styles.logo} />
          <h4 className={styles.title}>Sign In</h4>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Username Input */}
          <div className={styles.formGroup}>
            <label htmlFor="username" className={styles.label}>Username</label>
            <input
              type="text"
              id="username"
              placeholder="Enter username"
              value={inputUsername}
              onChange={(e) => setInputUsername(e.target.value)}
              required
              className={styles.input}
            />
          </div>

          {/* Password Input */}
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter password"
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              required
              className={styles.input}
            />
          </div>

          {/* Submit or Login button */}
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "Logging In..." : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
