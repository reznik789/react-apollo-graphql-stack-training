import React from 'react';

const CommentItem = ({ comment }) => {
  return (
    <div className="CommentItem">
      <h4>{comment.node.author.login}</h4>
      <div className="CommentItem-content">
        <div dangerouslySetInnerHTML={{ __html: comment.node.bodyHTML }} />
      </div>
    </div>
  );
};

export default CommentItem;
