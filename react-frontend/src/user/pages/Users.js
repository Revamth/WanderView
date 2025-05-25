import React from "react";

import UsersList from "../components/UsersList";
const Users = () => {
  const USERS = [
    {
      id: "u1",
      name: "Revamth",
      image:
        "https://images.emojiterra.com/google/android-10/512px/1f9cd-2642.png",
      places: 3,
    },
  ];
  return <UsersList items={USERS} />;
};

export default Users;
