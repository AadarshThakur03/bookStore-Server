const mongoose = require("mongoose");

const BookRequest = new mongoose.Schema(
  {
    email: String,
    book: String,
  },
  { collection: "BookRequest" }
);

mongoose.model("BookRequest", BookRequest);
