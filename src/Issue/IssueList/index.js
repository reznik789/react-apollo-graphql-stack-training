import React, { useState, useCallback, useMemo } from 'react';
import gql from 'graphql-tag';
import memoize from 'fast-memoize';
import { useQuery } from 'react-apollo';
import IssueItem from '../IssueItem';
import Loading from '../../Loading';
import ErrorMessage from '../../Error';
import { ButtonUnobtrusive } from '../../Button';
import './style.css';

const ISSUE_STATES = {
  NONE: 'NONE',
  OPEN: 'OPEN',
  CLOSED: 'CLOSED'
};

const TRANSITION_LABELS = {
  [ISSUE_STATES.NONE]: 'Show Open Issues',
  [ISSUE_STATES.OPEN]: 'Show Closed Issues',
  [ISSUE_STATES.CLOSED]: 'Hide Issues'
};

const TRANSITION_STATE = {
  [ISSUE_STATES.NONE]: ISSUE_STATES.OPEN,
  [ISSUE_STATES.OPEN]: ISSUE_STATES.CLOSED,
  [ISSUE_STATES.CLOSED]: ISSUE_STATES.NONE
};

const isShow = issueState => issueState !== ISSUE_STATES.NONE;

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

const IssueList = ({ issues }) => (
  <div className="IssueList">
    {issues.edges.map(({ node }) => (
      <IssueItem key={node.id} issue={node} />
    ))}
  </div>
);

const Issues = ({ repositoryOwner, repositoryName }) => {
  const [issueState, setIssueState] = useState(ISSUE_STATES.NONE);
  const { data, loading, error, fetchMore } = useQuery(GET_ISSUES_OF_REPOSITORY, {
    variables: {
      repositoryName,
      repositoryOwner
    },
    skip: !isShow(issueState)
  });

  const onChangeIssueState = useCallback(
    memoize(newState => () => setIssueState(newState)),
    []
  );
  const { issues } = (data || {}).repository || {};

  const filteredIssues = useMemo(() => {
    if (!issues || !issues.edges) return {};
    return {
      edges: issues.edges.filter(issue => issue.node.state === issueState)
    };
  }, [issues, issueState]);

  if (error) return <ErrorMessage error={error} />;

  if (loading && !issues) return <Loading />;

  return (
    <div className="Issues">
      <ButtonUnobtrusive onClick={onChangeIssueState(TRANSITION_STATE[issueState])}>
        {TRANSITION_LABELS[issueState]}
      </ButtonUnobtrusive>
      {!issues ? null : !filteredIssues.edges.length ? (
        <div className="IssueList">No issues ...</div>
      ) : (
        <IssueList issues={filteredIssues} />
      )}
    </div>
  );
};
export default Issues;
