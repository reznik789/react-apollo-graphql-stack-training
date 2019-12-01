import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Profile from '../Profile';
import Organization from '../Organization';
import * as routes from '../constants/routes';
import './style.css';

const WrappedOrganization = () => (
  <div className="App-content_large-header">
    <Organization />
  </div>
);

const WrappedProfile = () => (
  <div className="App-content_small-header">
    <Profile />
  </div>
);

const App = () => {
  return (
    <Router>
      <div className="App">
        <div className="App-main">
          <Route exact path={routes.ORGANIZATION} component={WrappedOrganization} />
          <Route exact path={routes.PROFILE} component={WrappedProfile} />
        </div>
      </div>
    </Router>
  );
};

export default App;
