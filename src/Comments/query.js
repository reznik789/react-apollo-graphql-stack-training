import gql from 'graphql-tag';

const COMMENT_FRAGMENT = gql`
  fragment issueCommentFragment on IssueComment {
    id
    bodyHTML
    author {
      login
    }
  }
`;

export const ISSUE_FRAGMENT = gql`
  fragment issue on Issue {
    id
    comments(first: 5, after: $cursor) {
      edges {
        node {
          ...issueCommentFragment
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${COMMENT_FRAGMENT}
`;

export const GET_COMMENTS_FOR_ISSUE = gql`
  query($repositoryName: String!, $repositoryOwner: String!, $issueNumber: Int!, $cursor: String) {
    repository(name: $repositoryName, owner: $repositoryOwner) {
      issue(number: $issueNumber) {
        ...issue
      }
    }
  }
  ${ISSUE_FRAGMENT}
`;

export const ADD_COMMENT_MUTATION = gql`
  mutation($subId: ID!, $body: String!) {
    addComment(input: { subjectId: $subId, body: $body }) {
      commentEdge {
        node {
          ...issueCommentFragment
        }
      }
    }
  }
  ${COMMENT_FRAGMENT}
`;
