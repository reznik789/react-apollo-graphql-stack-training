import React, { useState, useCallback } from 'react';
import gql from 'graphql-tag';
import memoize from 'fast-memoize';
import { useQuery, ApolloConsumer } from 'react-apollo';
import IssueItem from '../IssueItem';
import Loading from '../../Loading';
import ErrorMessage from '../../Error';
import FetchMore from '../../FetchMore';
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
  query($repositoryName: String!, $repositoryOwner: String!, $issueState: IssueState!, $cursor: String) {
    repository(name: $repositoryName, owner: $repositoryOwner) {
      issues(first: 5, filterBy: { states: [$issueState] }, after: $cursor) {
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
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

const updateQuery = (oldResult, { fetchMoreResult }) => {
  if (!fetchMoreResult.repository || !fetchMoreResult.repository.issues) return oldResult;
  return {
    repository: {
      ...oldResult.repository,
      issues: {
        ...oldResult.repository.issue,
        ...fetchMoreResult.repository.issues,
        edges: [...oldResult.repository.issues.edges, ...fetchMoreResult.repository.issues.edges]
      }
    }
  };
};
const IssueList = ({ issues, loading, fetchMore, issueState, repositoryName, repositoryOwner }) => (
  <div className="IssueList">
    {issues.edges.map(({ node }) => (
      <IssueItem key={node.id} issue={node} />
    ))}
    <FetchMore
      fetchMore={fetchMore}
      hasNextPage={issues.pageInfo.hasNextPage}
      updateQuery={updateQuery}
      variables={{
        issueState,
        repositoryName,
        repositoryOwner,
        cursor: issues.pageInfo.endCursor
      }}
      loading={loading}
    >
      Issues
    </FetchMore>
  </div>
);

const prefetchIssues = (client, issueState, repositoryName, repositoryOwner) => {
  const nextIssueState = TRANSITION_STATE[issueState];
  isShow(nextIssueState) &&
    client.query({
      query: GET_ISSUES_OF_REPOSITORY,
      variables: {
        repositoryName,
        repositoryOwner,
        issueState: nextIssueState
      }
    });
};

const IssueFilter = ({ issueState, repositoryName, repositoryOwner, onChangeIssueState }) => {
  return (
    <ApolloConsumer>
      {client => (
        <ButtonUnobtrusive
          onClick={onChangeIssueState(TRANSITION_STATE[issueState])}
          onMouseOver={() => {
            prefetchIssues(client, issueState, repositoryName, repositoryOwner);
          }}
        >
          {TRANSITION_LABELS[issueState]}
        </ButtonUnobtrusive>
      )}
    </ApolloConsumer>
  );
};

const Issues = ({ repositoryOwner, repositoryName }) => {
  const [issueState, setIssueState] = useState(ISSUE_STATES.NONE);
  const { data, loading, error, fetchMore } = useQuery(GET_ISSUES_OF_REPOSITORY, {
    variables: {
      repositoryName,
      repositoryOwner,
      issueState
    },
    skip: !isShow(issueState)
  });

  const onChangeIssueState = useCallback(memoize(newState => () => setIssueState(newState)), []);
  const { issues } = (data || {}).repository || {};

  if (error) return <ErrorMessage error={error} />;

  if (loading && !issues) return <Loading />;

  return (
    <div className="Issues">
      <IssueFilter
        issueState={issueState}
        repositoryOwner={repositoryOwner}
        repositoryName={repositoryName}
        onChangeIssueState={onChangeIssueState}
      />
      {!issues ? null : !issues.edges.length ? (
        <div className="IssueList">No issues ...</div>
      ) : (
        <IssueList
          issues={issues}
          loading={loading}
          fetchMore={fetchMore}
          issueState={issueState}
          repositoryOwner={repositoryOwner}
          repositoryName={repositoryName}
        />
      )}
    </div>
  );
};
export default Issues;
