const Author = require("../models/Author.jsx");
const Book = require("../models/Book.jsx");
const { GraphQLError } = require("graphql");
const User = require("../models/User.jsx");
const jwt = require("jsonwebtoken");
const { PubSub } = require("graphql-subscriptions");
const pubsub = new PubSub();

const resolvers = {
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(["BOOK_ADDED"]),
    },
  },
  Query: {
    me: (root, args, context) => context.currentUser,
    bookCount: async () => await Book.collection.countDocuments(),
    authorCount: async () => await Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      const filter = {};
      if (args.author) filter.author = args.author;
      if (args.genre) filter.genres = { $in: args.genre };

      const books = await Book.find(filter).populate("author", {
        name: 1,
        born: 1,
        books: 1,
      });
      return books;
    },
    allAuthors: async (root, args) => await Author.find({}),
    allGenres: async (root, args) => {
      const allBooks = await Book.find({});
      const genreList = allBooks.map((each) => each.genres);
      const genres = new Set([].concat.apply([], genreList));
      return [...genres];
    },
  },

  Mutation: {
    addBook: async (root, args, context) => {
      //Check if logged in
      const user = context.currentUser;

      if (!user) {
        throw new GraphQLError("not authenticated", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }
      //find author
      let author = await Author.findOne({ name: args.author });

      //if no author -> create new Author
      if (!author) {
        author = new Author({
          name: args.author,
          born: null,
          books: [],
        });
        try {
          await author.save();
        } catch (error) {
          throw new GraphQLError("Saving author failed", {
            extensions: {
              code: "BAD_USER_INPUT",
              invalidArgs: args.author,
              error,
            },
          });
        }
      }

      const book = new Book({ ...args, author: author._id });
      let addedBook = await book.save();
      author.books = author.books.concat(addedBook._id);
      let newAuthor = await author.save();
      addedBook = addedBook.toObject();
      const toReturn = {
        title: addedBook.title,
        published: addedBook.published,
        genres: addedBook.genres,
        author: {
          name: newAuthor.name,
          born: newAuthor.born,
          books: newAuthor.books,
        },
      };

      console.log(toReturn);

      pubsub.publish("BOOK_ADDED", {
        bookAdded: toReturn,
      });

      return toReturn;
    },
    editAuthor: async (root, args, context) => {
      //Check if logged in
      const user = context.currentUser;

      if (!user)
        throw new GraphQLError("not authenticated", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });

      if (args.setBornTo < 0)
        throw new GraphQLError("Birth year must be larger than 0.", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.setBornTo,
          },
        });

      if (args.setBornTo > 2024)
        throw new GraphQLError("Birth year must be smaller than 2024.", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.setBornTo,
          },
        });
      const author = await Author.findOne({ name: args.name });
      author.born = args.setBornTo;

      try {
        await author.save();
      } catch (error) {
        throw new GraphQLError("Editing author's born year failed.", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.setBornTo,
          },
        });
      }

      return author;
    },
    createUser: async (root, args) => {
      const user = await User.find({ username: args.username });
      if (!user) {
        throw new GraphQLError("User already exist", {
          extensions: { code: "BAD_USER_INPUT", invalidArgs: args.username },
        });
      }
      const newUser = new User({ ...args, password: "secret" });
      try {
        await newUser.save();
      } catch (error) {
        throw new GraphQLError("creating new user failed.", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.username,
          },
        });
      }
      return newUser;
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });
      if (!user || args.password !== "secret") {
        throw new GraphQLError("wrong credentials", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      };

      return {
        value: jwt.sign(userForToken, process.env.JWL_SECRET),
      };
    },
  },

  Book: {
    title: (root) => root.title,
    author: (root) => root.author,
    published: (root) => root.published,
    genres: (root) => root.genres,
  },

  Author: {
    name: (root) => root.name,
    bookCount: (root) => root.books.length,
    born: (root) => root.born,
  },
};

module.exports = resolvers;
