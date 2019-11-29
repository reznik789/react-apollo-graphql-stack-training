import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo';
import RepositoryList, { REPOSITORY_FRAGMENT } from '../Repository';
import ErrorMessage from '../Error';
import Loading from '../Loading';

const GET_REPOSITORIES_OF_CURRENT_USER = gql`
  query {
    viewer {
      repositories(first: 5, orderBy: { direction: DESC, field: STARGAZERS }) {
        edges {
          node {
            ...repository
          }
        }
      }
    }
  }

  ${REPOSITORY_FRAGMENT}
`;

const Profile = () => {
  const { data, loading, error } = useQuery(GET_REPOSITORIES_OF_CURRENT_USER);
  if (error) {
    return <ErrorMessage error={error} />;
  }
  const { viewer } = data || {};
  if (loading || !viewer) return <Loading />;

  return <RepositoryList repositories={viewer.repositories} />;
};

export default Profile;
