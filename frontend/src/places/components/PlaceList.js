/**
 * PlaceList.js — presentational list of places.
 *
 * Maps props.items to a PlaceItem per place and forwards the onDeletePlace
 * callback down so items can report deletions back to the parent page. Owns the
 * empty-state UI (with a call-to-action to create a place). No data fetching here.
 */
import Card from "../../shared/components/UIElements/Card";
import PlaceItem from "./PlaceItem";
import Button from "../../shared/components/FormElements/Button";
import "./PlaceList.css";

const PlaceList = (props) => {
  // Empty state: prompt the user to add a place instead of showing a blank list.
  if (props.items.length === 0) {
    return (
      <div className="place-list center">
        <Card>
          <h2>No places found. Maybe create one?</h2>
          <Button to="/places/new">Share Place</Button>
        </Card>
      </div>
    );
  }

  return (
    <ul className="place-list">
      {props.items.map((place) => (
        // Spread each place's fields into a PlaceItem. onDelete is the parent's
        // callback so a deleted item can be removed from the parent's state.
        <PlaceItem
          key={place.id}
          id={place.id}
          image={place.imageUrl}
          title={place.title}
          description={place.description}
          address={place.address}
          creatorId={place.creator}
          coordinates={place.location}
          onDelete={props.onDeletePlace}
        />
      ))}
    </ul>
  );
};

export default PlaceList;
