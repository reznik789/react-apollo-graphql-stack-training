import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo';
import IssueItem from '../IssueItem';
import Loading from '../../Loading';
import ErrorMessage from '../../Error';
import './style.css';

const GET_ISSUES_OF_REPOSITORY = gql`
  query($repositoryName: String!, $repositoryOwner: String!) {
    repository(name: $repositoryName, owner: $repositoryOwner) {
      issues(first: 5) {
        edges {
          node {
            id
            number
            state
            title
            url
            bodyHTML
          }
        }
        totalCount
      }
    }
  }
`;

const Issues = ({ repositoryOwner, repositoryName }) => {
  const { data, loading, error, fetchMore } = useQuery(GET_ISSUES_OF_REPOSITORY, {
    repositoryName,
    repositoryOwner
  });

  if (error) return <ErrorMessage error={error} />;
  const { issues } = (data || {}).repository || {};
  if (loading && !issues) return <Loading />;
  if (!issues.edges.length) {
    return <div className="IssueList">No issues ...</div>;
  }
  return <IssueList issues={issues} />;
};
export default Issues;
