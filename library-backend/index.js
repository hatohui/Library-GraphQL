const { ApolloServer } = require("@apollo/server");
const { WebSocketServer } = require("ws");
const { useServer } = require("graphql-ws/lib/use/ws");
const { expressMiddleware } = require("@apollo/server/express4");
const {
  ApolloServerPluginDrainHttpServer,
} = require("@apollo/server/plugin/drainHttpServer");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const mongoose = require("mongoose");
const User = require("./models/User.jsx");
const jwt = require("jsonwebtoken");
const typeDefs = require("./Schema/schema.js");
const resolvers = require("./resolvers/resolvers.js");
const express = require("express");
const cors = require("cors");
const http = require("http");

mongoose.set("strictQuery", false);
require("dotenv").config();

//get the link to DB
const MONGODB_URL = process.env.MONGODB_URL;

//connect to database
mongoose
  .connect(MONGODB_URL)
  .then(() => {
    console.log("connected");
  })
  .catch((error) => {
    console.log("error while connecting to DB: ", error.message);
  });

mongoose.set("debug", true);

//config server
const start = async () => {
  const app = express();
  const httpServer = http.createServer(app);

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });

  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const serverCleanup = useServer({ schema }, wsServer);

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await server.start();

  app.use(
    "/graphql",
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const authorization = req ? req.headers.authorization : null;
        if (authorization && authorization.startsWith("Bearer ")) {
          const decodedToken = jwt.verify(
            authorization.substring(7),
            process.env.JWT_SECRET
          );
          const currentUser = await User.findById(decodedToken.id);
          return { currentUser };
        }
      },
    })
  );

  const PORT = 4000;

  httpServer.listen(PORT, () =>
    console.log(`Server is now running on http://localhost:${PORT}`)
  );
};

start();
