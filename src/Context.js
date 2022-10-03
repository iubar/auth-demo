import React from "react";

export const Context = React.createContext({
  client_id: 0,
  client_secret: "",
  access_token: "a",
  refresh_token: "a",
  expires_in: 0,
});
