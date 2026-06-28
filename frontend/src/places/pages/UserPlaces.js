/**
 * UserPlaces.js — page showing every place belonging to one user.
 *
 * Reads :userId from the URL, fetches that user's places, and renders them via
 * PlaceList. It also owns the delete callback: when a child PlaceItem deletes a
 * place, this page removes it from local state optimistically so the UI updates
 * instantly without re-fetching the whole list.
 */
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import PlaceList from "../components/PlaceList";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import { useHttpClient } from "../../shared/hooks/http-hook";

const UserPlaces = () => {
  const [loadedPlaces, setLoadedPlaces] = useState();
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  const userId = useParams().userId;

  // Fetch this user's places. Re-runs if the userId in the URL changes, so
  // navigating from one user's places to another's loads the right data.
  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const responseData = await sendRequest(
          process.env.REACT_APP_BACKEND_URL + `/places/user/${userId}`
        );
        setLoadedPlaces(responseData.places);
      } catch (err) {}
    };
    fetchPlaces();
  }, [sendRequest, userId]);

  // OPTIMISTIC update: after a child confirms a delete, drop that place from
  // local state immediately instead of re-fetching the list. The backend delete
  // already happened in PlaceItem, so the UI just mirrors the new reality.
  const placeDeletedHandler = (deletedPlaceId) => {
    setLoadedPlaces((prevPlaces) =>
      prevPlaces.filter((place) => place.id !== deletedPlaceId)
    );
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )}
      {!isLoading && loadedPlaces && (
        <PlaceList items={loadedPlaces} onDeletePlace={placeDeletedHandler} />
      )}
    </React.Fragment>
  );
};

export default UserPlaces;
