import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
//import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import './LoginForm.css';
import './homepage.css';
import utiLogo from '../img/uti_logo.svg'


const LoginForm = ({
  onSubmit,
  onChange,
  errors,
  successMessage,
  user,
  toggleAuthenticateStatus
}) => (
  <div className="loginContainer">
    <header className="chatHeader">
      <img className="chatLogo" src={utiLogo} alt="uti et abuti logo"></img> 

    </header>
    
      <form className="inputContainer" action="/" onSubmit={onSubmit}>
        

        {successMessage && <p className="success-message">{successMessage}</p>}
        {errors.summary && <p className="error-message">{errors.summary}</p>}

        <div className="field-line">
          <TextField
            floatingLabelText="Password"
            type="password"
            name="password"
            id="passwordField"
            onChange={onChange}
            errorText={errors.password}
            value={user.password}
           
          />
        </div>
        <div id="someSpace"></div>

        <div className="button-line">
       <button id="loginBtn" type="submit">LOG IN</button>
        </div>

          {/*<RaisedButton id="loginBtn" type="submit" label="Log in" primary />*/}
       

      </form>
  </div>
);

LoginForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
  successMessage: PropTypes.string.isRequired,
  user: PropTypes.object.isRequired
};

export default LoginForm;