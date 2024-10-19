const mongoose = require("mongoose");

// const uniqueValidator = require("mongoose-unique-validator");

const schema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      minlength: 5,
    },
    published: {
      type: Number,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Author",
    },
    genres: [{ type: String }],
  },
  { collection: "Books" }
);

// schema.plugin(uniqueValidator);

schema.set("toJSON", {
  transform: (document, returned) => {
    returned.id = returned._id.toString();
    delete returned._id;
    delete returned.__v;
  },
});

module.exports = mongoose.model("Book", schema);
