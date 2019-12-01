import React from 'react';
import { useMutation } from 'react-apollo';
import gql from 'graphql-tag';
import Link from '../../Link';
import Button from '../../Button';
import REPOSITORY_FRAGMENT from '../fragments';
import '../style.css';

const VIEWER_SUBSCRIPTIONS = {
  SUBSCRIBED: 'SUBSCRIBED',
  UNSUBSCRIBED: 'UNSUBSCRIBED'
};

const STAR_REPOSITORY = gql`
  mutation($id: ID!) {
    addStar(input: { starrableId: $id }) {
      starrable {
        id
        viewerHasStarred
      }
    }
  }
`;

const UNSTAR_REPOSITORY = gql`
  mutation($id: ID!) {
    removeStar(input: { starrableId: $id }) {
      starrable {
        id
        viewerHasStarred
      }
    }
  }
`;

const UPDATE_SUBSCRIPTION = gql`
  mutation($id: ID!, $newState: SubscriptionState!) {
    updateSubscription(input: { subscribableId: $id, state: $newState }) {
      subscribable {
        id
        viewerSubscription
      }
    }
  }
`;

const getUpdatedStarsCount = (client, id, viewerHasStarred) => {
  const repository = client.readFragment({
    id: `Repository:${id}`,
    fragment: REPOSITORY_FRAGMENT
  });
  const totalCount = repository.stargazers.totalCount + (viewerHasStarred ? 1 : -1);
  return {
    ...repository,
    stargazers: {
      ...repository.stargazers,
      totalCount
    }
  };
};
const updateAddStar = (client, result) => {
  const {
    data: {
      addStar: {
        starrable: { id, viewerHasStarred }
      }
    }
  } = result;
  client.writeFragment({
    id: `Repository:${id}`,
    fragment: REPOSITORY_FRAGMENT,
    data: getUpdatedStarsCount(client, id, viewerHasStarred)
  });
};

const updateRemoveStar = (client, result) => {
  const {
    data: {
      removeStar: {
        starrable: { id, viewerHasStarred }
      }
    }
  } = result;
  client.writeFragment({
    id: `Repository:${id}`,
    fragment: REPOSITORY_FRAGMENT,
    data: getUpdatedStarsCount(client, id, viewerHasStarred)
  });
};

const updateWatchers = (client, result) => {
  const {
    data: {
      updateSubscription: {
        subscribable: { id, viewerSubscription }
      }
    }
  } = result;
  const repository = client.readFragment({
    id: `Repository:${id}`,
    fragment: REPOSITORY_FRAGMENT
  });
  const newWatchersCount =
    repository.watchers.totalCount + (viewerSubscription === VIEWER_SUBSCRIPTIONS.SUBSCRIBED ? 1 : -1);
  client.writeFragment({
    id: `Repository:${id}`,
    fragment: REPOSITORY_FRAGMENT,
    data: {
      ...repository,
      watchers: {
        ...repository.watchers,
        totalCount: newWatchersCount
      }
    }
  });
};

const subscriptionOptimisticResponse = (id, status) => ({
  updateSubscription: {
    __typename: 'Mutation',
    subscribable: {
      __typename: 'Repository',
      id: id,
      viewerSubscription: status
    }
  }
});

const RepositoryItem = ({
  id,
  name,
  url,
  descriptionHTML,
  primaryLanguage,
  owner,
  stargazers,
  watchers,
  viewerSubscription,
  viewerHasStarred
}) => {
  const [addStar] = useMutation(STAR_REPOSITORY, {
    variables: { id },
    update: updateAddStar,
    optimisticResponse: {
      addStar: {
        __typename: 'Mutation',
        starrable: {
          __typename: 'Repository',
          id: id,
          viewerHasStarred: true
        }
      }
    }
  });
  const [removeStar] = useMutation(UNSTAR_REPOSITORY, {
    variables: { id },
    update: updateRemoveStar,
    optimisticResponse: {
      removeStar: {
        __typename: 'Mutation',
        starrable: {
          __typename: 'Repository',
          id: id,
          viewerHasStarred: false
        }
      }
    }
  });
  const [subscribe] = useMutation(UPDATE_SUBSCRIPTION, {
    variables: { id, newState: VIEWER_SUBSCRIPTIONS.SUBSCRIBED },
    update: updateWatchers,
    optimisticResponse: subscriptionOptimisticResponse(id, VIEWER_SUBSCRIPTIONS.SUBSCRIBED)
  });
  const [unsubscribe] = useMutation(UPDATE_SUBSCRIPTION, {
    variables: { id, newState: VIEWER_SUBSCRIPTIONS.UNSUBSCRIBED },
    update: updateWatchers,
    optimisticResponse: subscriptionOptimisticResponse(id, VIEWER_SUBSCRIPTIONS.UNSUBSCRIBED)
  });
  return (
    <div>
      <div className="RepositoryItem-title">
        <h2>
          <Link href={url}>{name}</Link>
        </h2>
        {!viewerHasStarred ? (
          <Button className="RepositoryItem-title-action" onClick={addStar}>
            {stargazers.totalCount} Star
          </Button>
        ) : (
          <Button className="RepositoryItem-title-action" onClick={removeStar}>
            {stargazers.totalCount} Unstar
          </Button>
        )}
      </div>
      {viewerSubscription === VIEWER_SUBSCRIPTIONS.SUBSCRIBED ? (
        <Button className="RepositoryItem-title-action" onClick={unsubscribe}>
          {watchers.totalCount} UNSUBSCRIBE
        </Button>
      ) : (
        <Button className="RepositoryItem-title-action" onClick={subscribe}>
          {watchers.totalCount} SUBSCRIBE
        </Button>
      )}
      <div className="RepositoryItem-description">
        <div className="RepositoryItem-description-info" dangerouslySetInnerHTML={{ __html: descriptionHTML }} />
        <div className="RepositoryItem-description-details">
          <div>{primaryLanguage && <span>Language: {primaryLanguage.name}</span>}</div>
          <div>
            {owner && (
              <span>
                Owner: <a href={owner.url}>{owner.login}</a>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default RepositoryItem;
