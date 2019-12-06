import React, { useState } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Navigation from './Navigation';
import Profile from '../Profile';
import Organization from '../Organization';
import { OrganizationSearchContext } from './OrganizationSearchContext';
import * as routes from '../constants/routes';
import './style.css';

const WrappedProfile = () => (
  <div className="App-content_small-header">
    <Profile />
  </div>
);

const App = () => {
  const [organizationName, setOrganizationName] = useState('the-road-to-learn-react');
  return (
    <OrganizationSearchContext.Provider
      value={{
        organizationName,
        onOrganizationSearch: setOrganizationName
      }}
    >
      <Router>
        <div className="App">
          <Navigation />
          <div className="App-main">
            <Route
              exact
              path={routes.ORGANIZATION}
              render={() => (
                <div className="App-content_large-header">
                  <Organization organizationName={organizationName} />
                </div>
              )}
            />
            <Route exact path={routes.PROFILE} component={WrappedProfile} />
          </div>
        </div>
      </Router>
    </OrganizationSearchContext.Provider>
  );
};

export default App;
