const typeDefs = `
  type Subscription {
   bookAdded: Book!
  }    

  type Query {
    me: User
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    allGenres: [String!]!
  }

  type Book {
    title: String!
    author: Author!
    published: Int!
    genres: [String!]
  }

  type Author {
    name: String!
    bookCount: Int!
    born: Int
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ):Book

    editAuthor(
      name: String!
      setBornTo: Int!
    ):Author

    createUser(
      username: String!
      favoriteGenre: String!
    ): User

    login(
      username: String!
      password: String!
    ): Token
  }

  type User {
    username: String!
    favoriteGenre: String!
  }

  type Token {
    value: String!
  }
`;

module.exports = typeDefs;
