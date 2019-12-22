import React, { useState, useCallback } from 'react';
import Link from '../../Link';
import Button from '../../Button';
import Comments from '../../Comments';
import './style.css';
const IssueItem = ({ issue }) => {
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);
  const toggleComments = useCallback(() => setIsCommentsVisible(prevState => !prevState), []);
  return (
    <div className="IssueItem">
      <Button onClick={toggleComments}>{isCommentsVisible ? 'Hide Comments' : 'Show Comments'}</Button>
      <div className="IssueItem-content">
        <h3>
          <Link href={issue.url}>{issue.title}</Link>
        </h3>{' '}
        <div dangerouslySetInnerHTML={{ __html: issue.bodyHTML }} />
        {isCommentsVisible && <Comments />}
      </div>
    </div>
  );
};
export default IssueItem;
