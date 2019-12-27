import React, { useState, useCallback } from 'react';
import { ApolloConsumer } from 'react-apollo';
import Link from '../../Link';
import Button from '../../Button';
import Comments from '../../Comments';
import { GET_COMMENTS_FOR_ISSUE } from '../../Comments/query';
import './style.css';

const prefetchComments = (client, queryVariables) => {
  client.query({
    query: GET_COMMENTS_FOR_ISSUE,
    variables: queryVariables
  });
};

const IssueItem = ({ issue, repositoryName, repositoryOwner }) => {
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);
  const toggleComments = useCallback(() => setIsCommentsVisible(prevState => !prevState), []);
  return (
    <div className="IssueItem">
      <ApolloConsumer>
        {client => (
          <>
            <Button
              onMouseOver={() =>
                !isCommentsVisible &&
                prefetchComments(client, {
                  repositoryName,
                  repositoryOwner,
                  issueNumber: issue.number
                })
              }
              onClick={toggleComments}
            >
              {isCommentsVisible ? 'Hide Comments' : 'Show Comments'}
            </Button>
            <div className="IssueItem-content">
              <h3>
                <Link href={issue.url}>{issue.title}</Link>
              </h3>{' '}
              <div dangerouslySetInnerHTML={{ __html: issue.bodyHTML }} />
              {isCommentsVisible && (
                <Comments
                  repositoryName={repositoryName}
                  repositoryOwner={repositoryOwner}
                  issueNumber={issue.number}
                />
              )}
            </div>
          </>
        )}
      </ApolloConsumer>
    </div>
  );
};
export default IssueItem;
