const mongoose = require("mongoose");

const AdminDetailSchema = new mongoose.Schema({
  name: "",
  category: Array,
});
mongoose.model("AdminInfo", AdminDetailSchema);
