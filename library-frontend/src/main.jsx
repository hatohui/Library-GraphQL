import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import {
  ApolloClient,
  ApolloProvider,
  createHttpLink,
  InMemoryCache,
  split,
} from "@apollo/client";

//set up websocket
import { getMainDefinition } from "@apollo/client/utilities";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";

//imports
import { setContext } from "@apollo/client/link/context";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import { UserProvider } from "./context/currentUser.jsx";

//set authorization header
const authLink = setContext((_, { headers }) => {
  const user = window.localStorage.getItem("user");

  let token = null;
  if (user) {
    token = JSON.parse(user).token;
  }

  return {
    headers: {
      ...headers,
      authorization: token ? token : null,
    },
  };
});

//http link creation
const httpLink = createHttpLink({
  uri: "http://localhost:4000/graphql",
});

const wsLink = new GraphQLWsLink(
  createClient({ url: "ws://localhost:4000/graphql" })
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);

    //if operation == subsctiption return true
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  authLink.concat(httpLink)
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <BrowserRouter>
        <UserProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </UserProvider>
      </BrowserRouter>
    </ApolloProvider>
  </React.StrictMode>
);
