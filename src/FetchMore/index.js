import React, { useCallback } from 'react';
import Loading from '../Loading';
import { ButtonUnobtrusive } from '../Button';
import './style.css';
const FetchMore = ({ variables, updateQuery, fetchMore, children, loading, hasNextPage }) => {
  const onFetchMore = useCallback(() => fetchMore({ variables, updateQuery }), [variables, updateQuery, fetchMore]);
  return (
    <div className="FetchMore">
      {loading ? (
        <Loading />
      ) : (
        hasNextPage && (
          <ButtonUnobtrusive className="FetchMore-button" onClick={onFetchMore}>
            More {children}
          </ButtonUnobtrusive>
        )
      )}
    </div>
  );
};
export default FetchMore;
