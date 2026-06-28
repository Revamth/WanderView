/**
 * UsersList.js — presentational list of users.
 *
 * Receives an array of users via props.items and renders one UsersItem card per
 * user. Owns the empty-state UI and derives each card's place count from the
 * user's places array. Purely presentational — data fetching lives in Users.js.
 */
import UsersItem from "./UsersItem";
import Card from "../../shared/components/UIElements/Card";
import "./UsersList.css";

const UsersList = (props) => {
  // Empty state: show a friendly card instead of an empty <ul>.
  if (props.items.length === 0) {
    return (
      <div className="center">
        <Card>
          <h2>No users found.</h2>
        </Card>
      </div>
    );
  }

  return (
    <ul className="users-list">
      {props.items.map((user) => (
        // placeCount is derived here from the user's places array so the card
        // itself only needs a number, not the full list of places.
        <UsersItem
          key={user.id}
          id={user.id}
          imageUrl={user.imageUrl}
          name={user.name}
          placeCount={user.places.length}
        />
      ))}
    </ul>
  );
};

export default UsersList;
