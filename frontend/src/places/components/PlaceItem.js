/**
 * PlaceItem.js — a single place card with map view and owner controls.
 *
 * Displays one place and offers "View on map", "Edit" and "Delete". The map and
 * delete confirmation are shown in modals. EDIT/DELETE only appear to the place's
 * owner (client-side ownership check). Delete hits the backend, then notifies the
 * parent via props.onDelete so the list can update.
 */
import React, { useState, useContext } from "react";

import Card from "../../shared/components/UIElements/Card";
import Button from "../../shared/components/FormElements/Button";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import { AuthContext } from "../../shared/context/auth-context";
import { useHttpClient } from "../../shared/hooks/http-hook";
import "./PlaceItem.css";

// Lazy-load Modal and Map: they're only needed when the user opens a modal,
// so code-splitting them keeps the initial bundle (and list render) lighter.
const Modal = React.lazy(() =>
  import("../../shared/components/UIElements/Modal")
);
const Map = React.lazy(() => import("../../shared/components/UIElements/Map"));

const PlaceItem = (props) => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const auth = useContext(AuthContext);
  // Two independent modals: one toggles the map view, the other the
  // delete-confirmation dialog.
  const [showMap, setShowMap] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const openMapHandler = () => setShowMap(true);
  const closeMapHandler = () => setShowMap(false);

  const showDeleteWarningHandler = () => {
    setShowConfirmModal(true);
  };

  const cancelDeleteHandler = () => {
    setShowConfirmModal(false);
  };

  // Runs when the user confirms deletion in the dialog.
  const confirmDeleteHandler = async () => {
    setShowConfirmModal(false);
    try {
      // Authenticated DELETE to the backend (bearer token proves ownership).
      await sendRequest(
        process.env.REACT_APP_BACKEND_URL + `/places/${props.id}`,
        "DELETE",
        null,
        {
          Authorization: "Bearer " + auth.token,
        }
      );
      // Tell the parent (UserPlaces) to drop this place from its list state.
      props.onDelete(props.id);
    } catch (err) {}
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />

      {/* Modal #1: map view, showing the place's location. */}
      <Modal
        show={showMap}
        onCancel={closeMapHandler}
        header={props.address}
        contentClass="place-item__modal-content"
        footerClass="place-item__modal-actions"
        footer={<Button onClick={closeMapHandler}>CLOSE</Button>}
      >
        <div className="map-container">
          <Map center={props.coordinates} zoom={16} show={showMap} />
        </div>
      </Modal>

      {/* Modal #2: delete confirmation, with Cancel and Delete actions. */}
      <Modal
        show={showConfirmModal}
        onCancel={cancelDeleteHandler}
        header="Are you sure?"
        footerClass="place-item__modal-actions"
        footer={
          <React.Fragment>
            <Button inverse onClick={cancelDeleteHandler}>
              CANCEL
            </Button>
            <Button danger onClick={confirmDeleteHandler}>
              DELETE
            </Button>
          </React.Fragment>
        }
      >
        <p>
          Do you want to proceed and delete this place? Please note that it
          can't be undone thereafter.
        </p>
      </Modal>

      <li className="place-item">
        <Card className="place-item__content">
          {isLoading && <LoadingSpinner asOverlay />}
          <div className="place-item__left-content">
            <div className="place-item__info">
              <h2>{props.title}</h2>
              <h3>{props.address}</h3>
              <p>{props.description}</p>
            </div>
            <div className="place-item__actions">
              <Button inverse onClick={openMapHandler}>
                VIEW ON MAP
              </Button>
              {/* Client-side ownership gate: only the creator sees EDIT/DELETE.
                  This is a UX convenience only — the backend independently
                  re-checks ownership on the actual edit/delete requests. */}
              {auth.userId === props.creatorId && (
                <Button to={`/places/${props.id}`}>EDIT</Button>
              )}
              {auth.userId === props.creatorId && (
                <Button danger onClick={showDeleteWarningHandler}>
                  DELETE
                </Button>
              )}
            </div>
          </div>
          <div className="place-item__image">
            <img
              src={props.image || "https://via.placeholder.com/300"}
              alt={props.title}
            />
          </div>
        </Card>
      </li>
    </React.Fragment>
  );
};

export default PlaceItem;
