/**
 * UsersItem.js — a single user card.
 *
 * Renders one user's avatar, name and place count. The whole card is a Link to
 * that user's places page (/:userId/places), so clicking a user navigates to
 * their list of shared places.
 */
import { Link } from "react-router-dom";

import Avatar from "../../shared/components/UIElements/Avatar";
import Card from "../../shared/components/UIElements/Card";
import "./UsersItem.css";

const UsersItem = (props) => {
  return (
    <li className="user-item">
      <Card className="user-item__content">
        {/* The entire card links to this user's places page. */}
        <Link to={`/${props.id}/places`}>
          <div className="user-item__image">
            {/* Fall back to a placeholder avatar if the user has no image. */}
            <Avatar
              image={props.imageUrl || "https://placehold.co/150x150"}
              alt={props.name}
            />
          </div>
          <div className="user-item__info">
            <h2>{props.name}</h2>
            {/* Pluralize the label: "1 Place" vs "N Places". */}
            <h3>
              {props.placeCount} {props.placeCount === 1 ? "Place" : "Places"}
            </h3>
          </div>
        </Link>
      </Card>
    </li>
  );
};

export default UsersItem;
