import React, { useContext, useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as routes from '../../constants/routes';
import { OrganizationSearchContext } from '../OrganizationSearchContext';
import Button from '../../Button';
import Input from '../../Input';
import './style.css';

const OrganizationSearch = React.memo(props => {
  const { organizationName: contextOrganizationName, onOrganizationSearch } = useContext(OrganizationSearchContext);
  const [organizationName, setOrganizationName] = useState(contextOrganizationName);
  const onChange = useCallback(event => setOrganizationName(event.target.value), [setOrganizationName]);

  const onSubmit = useCallback(
    event => {
      event.preventDefault();
      onOrganizationSearch(organizationName);
    },
    [organizationName, onOrganizationSearch]
  );
  return (
    <div className="Navigation-search">
      <form onSubmit={onSubmit}>
        <Input color={'white'} type="text" value={organizationName} onChange={onChange} />{' '}
        <Button color={'white'} type="submit">
          Search
        </Button>
      </form>
    </div>
  );
});

const Navigation = () => {
  const { pathname } = useLocation();
  return (
    <header className="Navigation">
      <div className="Navigation-link">
        <Link to={routes.PROFILE}>Profile</Link>
      </div>
      <div className="Navigation-link">
        <Link to={routes.ORGANIZATION}>Organization</Link>
      </div>
      {pathname === routes.ORGANIZATION && <OrganizationSearch />}
    </header>
  );
};
export default Navigation;
