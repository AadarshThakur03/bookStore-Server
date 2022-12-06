const mongoose = require("mongoose");

const AuthorDetailSchema = new mongoose.Schema({
  image: "",
  name: "",
  description: "",
});
mongoose.model("AuthorInfo", AuthorDetailSchema);
