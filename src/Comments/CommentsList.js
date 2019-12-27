import React from 'react';
import CommentItem from './CommentItem';
import Loading from '../Loading';
import ErrorMessage from '../Error';
import FetchMore from '../FetchMore';
import AddComment from './AddComment';
import { GET_COMMENTS_FOR_ISSUE } from './query';
import { useQuery } from 'react-apollo';

const updateQuery = (prevResult, { fetchMoreResult }) => {
  if (!fetchMoreResult || !fetchMoreResult.repository) return prevResult;
  const existingIds = prevResult.repository.issue.comments.edges.map(edge => edge.node.id);
  return {
    ...prevResult,
    repository: {
      ...prevResult.repository,
      issue: {
        ...prevResult.repository.issue,
        ...fetchMoreResult.repository.issue,
        comments: {
          ...prevResult.repository.issue.comments,
          ...fetchMoreResult.repository.issue.comments,
          edges: [
            ...prevResult.repository.issue.comments.edges,
            ...fetchMoreResult.repository.issue.comments.edges.filter(({ node }) => !existingIds.includes(node.id))
          ]
        }
      }
    }
  };
};

const CommentsList = ({ repositoryName, repositoryOwner, issueNumber }) => {
  const { data, error, loading, fetchMore } = useQuery(GET_COMMENTS_FOR_ISSUE, {
    variables: { repositoryName, repositoryOwner, issueNumber },
    notifyOnNetworkStatusChange: true
  });

  const { issue } = (data || {}).repository || {};

  if (error) return <ErrorMessage error={error} />;

  if (loading && !issue) return <Loading />;

  return (
    <div className="Comments">
      {issue.comments.edges.length ? (
        <div className="CommentsList">
          {issue.comments.edges.map(comment => (
            <CommentItem key={comment.node.id} comment={comment} />
          ))}
          <FetchMore
            variables={{
              repositoryName,
              repositoryOwner,
              issueNumber,
              cursor: issue.comments.pageInfo.endCursor
            }}
            updateQuery={updateQuery}
            fetchMore={fetchMore}
            loading={loading}
            hasNextPage={issue.comments.pageInfo.hasNextPage}
          >
            Comments
          </FetchMore>
          <AddComment issue={issue} />
        </div>
      ) : (
        <div className="CommentsList">No comments yet</div>
      )}
    </div>
  );
};

export default CommentsList;
