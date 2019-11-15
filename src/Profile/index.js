import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo';

const GET_CURRENT_USER = gql`
  {
    viewer {
      login
      name
    }
  }
`;

const Profile = () => {
  const { data, loading } = useQuery(GET_CURRENT_USER);
  if (loading) return <div>...Loading</div>;
  const { viewer } = data;

  return (
    <div>
      {viewer.name} {viewer.login}
    </div>
  );
};

export default Profile;
