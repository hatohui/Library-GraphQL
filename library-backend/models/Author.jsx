const mongoose = require("mongoose");

// const uniqueValidator = require("mongoose-unique-validator");

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      minlength: 4,
    },
    born: {
      type: Number,
    },
    books: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
  },
  { collection: "Authors" }
);

// schema.plugin(uniqueValidator);

schema.set("toJSON", {
  transform: (document, returned) => {
    returned.id = returned._id.toString();
    delete returned._id;
    delete returned.__v;
  },
});

module.exports = mongoose.model("Author", schema);
