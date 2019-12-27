import React, { useCallback, useState } from 'react';
import { useMutation } from 'react-apollo';
import { ADD_COMMENT_MUTATION, ISSUE_FRAGMENT } from '../query';
import Button from '../../Button';

/**{
  "id": "MDU6SXNzdWUyNjc4Nzg5NTU=",
  "comments": {
    "edges": [
      {
        "node": {
          "id": "MDEyOklzc3VlQ29tbWVudDQxMzEyMDQ5MA==",
          "bodyHTML": "<p>comment</p>",
          "author": {
            "login": "vfa-giangnt",
            "__typename": "User"
          },
          "__typename": "IssueComment"
        },
        "__typename": "IssueCommentEdge"
      },
      {
        "node": {
          "id": "MDEyOklzc3VlQ29tbWVudDQxMzE2NjAwMw==",
          "bodyHTML": "<p><a class=\"user-mention\" data-hovercard-type=\"user\" data-hovercard-url=\"/users/giangnt-vfa/hovercard\" data-octo-click=\"hovercard-link-click\" data-octo-dimensions=\"link_type:self\" href=\"https://github.com/giangnt-vfa\">@giangnt-vfa</a> Congrats! I guess you used the GraphQL  GitHub API from <a rel=\"nofollow\" href=\"https://www.robinwieruch.de/react-with-graphql-tutorial/\">https://www.robinwieruch.de/react-with-graphql-tutorial/</a> :)</p>",
          "author": {
            "login": "rwieruch",
            "__typename": "User"
          },
          "__typename": "IssueComment"
        },
        "__typename": "IssueCommentEdge"
      },
      {
        "node": {
          "id": "MDEyOklzc3VlQ29tbWVudDQ2NDA1NDA3Nw==",
          "bodyHTML": "<p>my comment</p>",
          "author": {
            "login": "sb-bilal-dev",
            "__typename": "User"
          },
          "__typename": "IssueComment"
        },
        "__typename": "IssueCommentEdge"
      },
      {
        "node": {
          "id": "MDEyOklzc3VlQ29tbWVudDQ2NDI3NzIxNw==",
          "bodyHTML": "<p>Congrats for making the Commenting API work <a class=\"user-mention\" data-hovercard-type=\"user\" data-hovercard-url=\"/users/sb-bilal-dev/hovercard\" data-octo-click=\"hovercard-link-click\" data-octo-dimensions=\"link_type:self\" href=\"https://github.com/sb-bilal-dev\">@sb-bilal-dev</a> <g-emoji class=\"g-emoji\" alias=\"tada\" fallback-src=\"https://github.githubassets.com/images/icons/emoji/unicode/1f389.png\">🎉</g-emoji></p>",
          "author": {
            "login": "rwieruch",
            "__typename": "User"
          },
          "__typename": "IssueComment"
        },
        "__typename": "IssueCommentEdge"
      },
      {
        "node": {
          "id": "MDEyOklzc3VlQ29tbWVudDQ4NjU1OTc5Mw==",
          "bodyHTML": "<p>nice!</p>",
          "author": {
            "login": "Hack-Jay",
            "__typename": "User"
          },
          "__typename": "IssueComment"
        },
        "__typename": "IssueCommentEdge"
      }
    ],
    "pageInfo": {
      "hasNextPage": true,
      "endCursor": "Y3Vyc29yOnYyOpHOHQBQMQ==",
      "__typename": "PageInfo"
    },
    "__typename": "IssueCommentConnection"
  },
  "__typename": "Issue"
} */

const createUpdateCommentsAfterMutation = issueId => (cache, { data: { addComment } }) => {
  const cashedIssue = cache.readFragment({
    id: `Issue:${issueId}`,
    fragment: ISSUE_FRAGMENT,
    fragmentName: 'issue'
  });
  cache.writeFragment({
    id: `Issue:${issueId}`,
    fragment: ISSUE_FRAGMENT,
    fragmentName: 'issue',
    data: {
      ...cashedIssue,
      comments: {
        ...cashedIssue.comments,
        edges: [...cashedIssue.comments.edges, addComment.commentEdge]
      }
    }
  });
};

const AddComment = ({ issue }) => {
  const [commentText, setCommentText] = useState('');
  const [addComment] = useMutation(ADD_COMMENT_MUTATION, {
    update: createUpdateCommentsAfterMutation(issue.id),
    optimisticResponse: {
      addComment: {
        __typename: 'AddCommentPayload',
        commentEdge: {
          __typename: 'IssueCommentEdge',
          node: {
            __typename: 'IssueComment',
            id: Math.round(Math.random() * -1000000),
            bodyHTML: `<p>${commentText}</p>`,
            author: {
              login: 'reznik789',
              __typename: 'User'
            }
          }
        }
      }
    }
  });
  const onTextAreaChange = useCallback(e => {
    setCommentText(e.target.value);
  }, []);
  const onSumbmitHandler = useCallback(
    e => {
      e.preventDefault();
      addComment({
        variables: {
          subId: issue.id,
          body: commentText
        }
      });
    },
    [commentText, addComment, issue]
  );

  return (
    <form className="AddComment" onSubmit={onSumbmitHandler}>
      <label htmlFor="comment">Comment text</label>
      <textarea name="comment" id="comment" cols="30" rows="10" onChange={onTextAreaChange} />
      <Button type="submit">Add</Button>
    </form>
  );
};

export default AddComment;
