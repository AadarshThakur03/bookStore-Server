const mongoose = require("mongoose");
const express = require("express");
const app = express();
const bcrypt = require("bcryptjs");
const PORT = 5000
const cors = require("cors");

app.use(cors());

app.use(express.json());
//Connecting to Mongo Db
const mongoUri =
  "mongodb+srv://admin:admin@cluster0.cheqvbk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const jwt = require("jsonwebtoken");

const JWT_SECRET =
  "jhuguiy(*@(*&*(#$8u49579434759847)(!*)(&)(&!$xquyeriuhkj&*(&*#fhgfjkghjhalkhjhfg";

mongoose
  .connect(mongoUri, {
    useNewUrlParser: true,
  })
  .then(() => console.log("Connected to database"))
  .catch((e) => console.log(e));

//initializing model

require("./UserDetails");
const User = mongoose.model("UserInfo");
console.log(User);

app.get("/", async (req, res) => {
  res.send("OOOHHHHOOO");
});
//registering as a guest
app.post("/register-guest", async (req, res) => {
  try {
    const { guestId } = req.body;

    const user = await User.create({
      guestId,
    });
    // Create token
    const token = jwt.sign({ guestId }, JWT_SECRET);
    if (res.status(201)) {
      console.log(token);
      return res.json({ status: "ok", data: token });
    } else {
      return res.json({
        status: "warning",
        data: { userStatus: user.status },
      });
    }
  } catch (err) {
    console.log(err);
  }
});

app.post("/register-new-user", async (req, res) => {
  // const {
  //   guestId,
  //   uname,
  //   email,
  //   password: encryptedPassword,
  //   mobile,
  // } = req.body;

  // const password = await bcrypt.hash(encryptedPassword, 10);
  // try {
  //   const oldUser = await User.findOne({ email });
  //   console.log(1234);

  //   if (oldUser) {
  //     return res.json({
  //       error: "User already exists with same email",
  //     });
  //   }
  //   const user = await User.create({
  //     guestId,
  //     uname,
  //     email,
  //     password,
  //     mobile,
  //   });
  //   res.json({ status: "Success", data: user });
  // } catch (error) {
  //   console.log(error, "new user cannot be created");
  //   res.json({ status: "error" });
  // }

  const {
    guestId,
    uname,
    email,
    password: encryptedPassword,
    mobile,
  } = req.body;

  const password = await bcrypt.hash(encryptedPassword, 10);
  try {
    const oldUser1 = await User.findOne({ mobile });
    console.log(oldUser1, "1111");
    const oldUser = await User.findOne({ email });

    if (oldUser1) {
      return res.json({
        error: "User already exists with same mobile",
      });
    }
    if (oldUser) {
      return res.json({
        error: "User already exists with same email",
      });
    }
    const user = await User.create({
      guestId,
      uname,
      email,
      password,
      mobile,
    });
  } catch (error) {
    console.log(error, "new user cannot be created");
    res.json({ status: "error" });
  }
  res.json({ status: "ok" });
});
app.post("/register-social", async (req, res) => {
  const { email, uname, profile } = req.body;
  try {
    const oldUser = await User.findOne({ email });
    if (oldUser) {
      return res.json({
        error: "User already exists with same email",
      });
    }
    console.log(req.body);
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const user = await User.create({
      uname,
      email,
      profile,
      googleLogin: true,
      guestId
    });
    res.json({ status: "success", data: user });
  } catch (error) {
    console.log(error, "new user cannot be created");
    res.json({ status: "error" });
  }
});
app.post("/social-login", async (req, res) => {
  const { email } = req.body;
  const oldUser = await User.findOne({ email });
  console.log(oldUser, "user");
  if (oldUser) {
    const token = jwt.sign(
      {
        email: email,
      },
      JWT_SECRET
    );
    if (res.status(201)) {
      return res.json({ status: "ok", data: token });
    } else {
      return res.json({
        status: "warning",
        data: { status: "error", data: "error" },
      });
    }
  }
  res.json({ status: "error", error: "Invalid mobile/password" });
});
app.post("/mobile-check", async (req, res) => {
  const { mobile } = req.body;
  try {
    const user = await User.findOne({ mobile }).lean();
    if (!user) {
      return res.json({ status: "error", error: "User Not found" });
    }
  } catch (error) {
    res.json({ status: "error", error: error });
  }

  res.json({ status: "ok", data: "User Founded" });
});
app.post("/email-check", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email }).lean();
    if (!user) {
      return res.json({ status: "error", error: "User Not found" });
    }
  } catch (error) {
    res.json({ status: "error", error: error });
  }

  res.json({ status: "ok", data: "User Founded" });
});
app.post("/forgot-password", async (req, res) => {
  const { mobile, encryptedPassword } = req.body;
  try {
    // const user1 = await User.findOne({ mobile }).lean();
    // if (!user1) {
    //   return res.json({ status: "error", error: "User Not found" });
    // }
    const password = await bcrypt.hash(encryptedPassword, 10);

    const user = await User.findOne({ mobile: mobile }).then((data) => {
      console.log(data);
      User.updateOne(
        {
          mobile: mobile,
        },
        {
          $set: {
            password: password,
          },
        },
        { overwrite: false, new: true },
        function (err, res) {
          console.log(err, res);
        }
      );
    });
    res.json({ status: "ok", data: "Password Updated" });
  } catch (error) {
    res.json({ status: "error", data: error });
  }
});
app.post("/login-user", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({
    $or: [
      {
        email: email,
      },
      {
        mobile: email,
      },
    ],
  }).lean();

  if (!user) {
    return res.json({ status: "error", error: "User Not found" });
  }
  if (user.password == undefined) {
    return res.json({ status: "error", error: "Password Not found" });
  }
  if (await bcrypt.compare(password, user.password)) {
    const token = jwt.sign(
      {
        guestId: user.guestId,
        mobile: user.email,
        email: user.email,
      },
      JWT_SECRET
    );
    console.log(user.status, "stat");

    if (res.status(201)) {
      return res.json({ status: "ok", data: token });
    } else {
      return res.json({
        status: "warning",
        data: { userStatus: user.status, userType: user.type },
      });
    }
  }
  res.json({ status: "error", error: "Invalid mobile/password" });
});

app.post("/user-details", async (req, res) => {
  const { token } = req.body;
  try {
    const user = jwt.verify(token, JWT_SECRET);

    const useremail = user.email;
    const userid = user.guestId;
    console.log(userid, "us");
    User.findOne(
      useremail == undefined ? { guestId: userid } : { email: useremail }
    )
      .then((data) => {
        console.log(data, "dat");
        return res.json({ status: "ok", data: data });
      })
      .catch((err) => {
        return res.json({ status: "error", error: err });
      });
  } catch (error) {
    console.log(error);
    res.json({ status: "error", error: error });
  }
});

app.post("/set-user-details", (req, res) => {
  const { token, fields } = req.body;
  try {
    const user = jwt.verify(token, JWT_SECRET);
    console.log(user, "userdaa");
    const email = user.email;
    User.updateOne(
      {
        email: email,
      },
      {
        $set: fields,
      },
      { overwrite: false, new: true },
      function (err, res) {
        console.log(err, res);
      }
    );
    return res.json({ status: "ok", data: "updated" });
  } catch (error) {
    res.json({ status: "error", error: error });
  }
});

app.post("/get-user", async (req, res) => {
  console.log("user");
  User.find({})
    .then((data) => {
      res.json({ status: "ok", data: data });
    })
    .catch((err) => {
      res.json({ status: "ok", error: err });
    });
});
app.post("/delete-user", async (req, res) => {
  const { userid } = req.body;
  try {
    User.deleteOne(
      {
        _id: userid,
      },
      function (err, res) {
        console.log(err, res);
      }
    );
    return res.json({ status: "ok", data: "Deleted" });
  } catch (error) {
    console.log(error);
  }
});
/////////////////////////////////////////////////////////////////////////////////////////////////

require("./BookDetails");
const Books = new mongoose.model("BookDetails");

app.post("/upload-book", async (req, res) => {
  console.log(123);
  try {
    const {
      title,
      uploadedBy,
      date,
      author,
      category,
      description,
      image,
      pdf,
      review,
      rating,
      email,
      ratingCount,
      ratingAdd,
    } = req.body;
    console.log(req.body, "rate");
    const book = await Books.create({
      title,
      uploadedBy,
      date,
      author,
      category,
      description,
      image,
      pdf,
      review,
      rating,
      email,
      ratingCount,
      ratingAdd,
    });
    res.json({ status: "ok", data: book });
    console.log(book, "boook");
    try {
      User.findOne({ email: email }).then((data) => {
        var totalBooksUploaded = new Array();

        if (data.booksUploaded == undefined || data.booksUploaded == "") {
          totalBooksUploaded.push(book._id);
        } else {
          totalBooksUploaded = [...data.booksUploaded, book._id.toString()];
          console.log(totalBooksUploaded, "yesss");
        }
        User.updateOne(
          {
            email: email,
          },
          {
            $set: {
              booksUploaded: totalBooksUploaded,
            },
          },
          { overwrite: false, new: true },
          function (err, res) {
            console.log(res, err);
          }
        );
      });
    } catch (err) {
      res.send(err);
    }
  } catch (error) {
    res.send(error);
  }
});

app.post("/give-rating", async (req, res) => {
  const { bookid, rating, review } = req.body;
  try {
    Books.findOne({ _id: bookid }).then((data) => {
      const bookrating = parseFloat(data.ratingAdd);
      const ratingCount = parseInt(data.ratingCount + 1);
      const totalRating = (bookrating + rating) / ratingCount;
      console.log(totalRating, "total");

      var allReview = new Array();

      if (data.review == undefined || data.review == "") {
        allReview.push(review);
      } else {
        allReview = [...data.review, review];
      }
      console.log(allReview, "review");
      Books.updateOne(
        {
          _id: bookid,
        },
        {
          $set: {
            review: allReview,
            rating: parseFloat(totalRating),
            ratingCount: ratingCount,
            ratingAdd: bookrating + rating,
          },
        },
        { overwrite: false, new: true },
        function (err, res) {
          console.log(res, err);
        }
      );
    });
    return res.json({ data: "Updated" });
  } catch (error) {}
});

app.post("/get-user-uploadedbooks", async (req, res) => {
  const userids = req.body.userids;
  Books.find({ _id: { $in: userids } })
    .then((data) => {
      res.json({ status: "ok", data: data });
    })
    .catch((err) => {
      res.json({ status: "ok", error: err });
    });
});

app.post("/get-book-details", async (req, res) => {
  const { status } = req.body;

  if (status == "all") {
    Books.find({})
      .then((data) => {
        res.json({ status: "ok", data: data });
      })
      .catch((err) => {
        res.json({ status: "ok", error: err });
      });
  } else {
    Books.find({ status: status })
      .then((data) => {
        res.json({ status: "ok", data: data });
      })
      .catch((err) => {
        res.json({ status: "ok", error: err });
      });
  }
});

app.post("/get", async (req, res) => {
  Books.find({})
    .then((data) => {
      res.json({ status: "ok", data: data });
    })
    .catch((err) => {
      res.json({ status: "ok", error: err });
    });
});
// app.post("/get-book-details", async (req, res, next) => {
//   const requestCount = req.query.count;
//   Books.find({ status: 0 })
//     .countDocuments()
//     .then((count) => {
//       if (requestCount > count) {
//         const error = new Error("invalid request in quantity");
//         error.statusCode = 400;
//         throw error;
//       }

//       return Books.find({ status: 0 }).limit(Number(requestCount));
//     })
//     .then((posts) => {
//       res.status(200).json({ posts: posts });
//     })
//     .catch((err) => {
//       res.json({ status: "ok", error: err });
//     });
// });

app.post("/get-review", async (req, res) => {
  const requestCount = req.query.count;
  const bookid = req.body.bookid;
  Books.find({ _id: bookid }, { review: 1, _id: 0 })
    // .countDocuments()
    .then((data) => {
      console.log(requestCount, "req");
      const count = data[0].review.length;
      const finaldata = 0;
      if (requestCount > count) {
        const a = data[0].review.reverse();
        res.json({
          status: "finish",
          data: a.slice(0, count),
        });
        // const error = new Error("invalid request in quantity");
        // error.statusCode = 400;
        // throw error;
      } else {
        const a = data[0].review.reverse();
        console.log(a.slice(0, requestCount), "aaaaa");

        res.json({
          status: "ok",
          data: a.slice(0, requestCount),
        });
      }
    })
    .catch((err) => {
      res.json({ status: "error", error: err });
    });
});

app.post("/update-book", async (req, res) => {
  const { userid, fields } = req.body;
  try {
    Books.updateOne(
      { _id: userid },
      {
        $set: fields,
      },
      { overwrite: false, new: true },
      function (err, res) {
        console.log(err, res);
      }
    );
    return res.json({ status: "ok", data: "Updated" });
  } catch (error) {
    console.log(error);
  }
});

app.post("/delete-book", async (req, res) => {
  const { userid } = req.body;
  try {
    Books.deleteOne(
      {
        _id: userid,
      },
      function (err, res) {
        console.log(err, res);
      }
    );
    return res.json({ status: "ok", data: "Deleted" });
  } catch (error) {
    console.log(error);
  }
});

app.post("/bookmark", async (req, res) => {
  const { bookId, pageNo, userId, totalPage } = req.body;
  console.log(req.body, "aaaaaaaa");
  const bU = {
    bookId: bookId,
    pageNo: pageNo,
    totalPage,
  };
  const user = User.findOne({ _id: userId }).then((data) => {
    var totalBookmarked = [];

    if (
      data.bookmarked == "" ||
      data.bookmarked == null ||
      data.bookmarked == undefined
    ) {
      totalBookmarked.push(bU);
    } else {
      var total = data.bookmarked;
      total.map((x) => {
        if (x.bookId._id == bookId._id) {
          total = total.filter(function (item) {
            return item.bookId._id !== bookId._id;
          });
        }
      });

      totalBookmarked = [...total, bU];
    }

    User.updateOne(
      { _id: userId },
      {
        $set: {
          bookmarked: totalBookmarked,
        },
      },
      { overwrite: false, new: true },
      function (err, res) {
        console.log(res, err);
      }
    );
    return res.json({ status: "ok", data: data.bookmarked });
  });
});

app.post("/add-meaning", async (req, res) => {
  const { savedMeanings, userid } = req.body;
  console.log(userid, "id");
  User.findOne({ _id: userid }).then((data) => {
    var allMeanings = [];
    console.log(data, "data");
    if (
      data.savedMeanings == "" ||
      data.savedMeanings == null ||
      data.savedMeanings == undefined
    ) {
      allMeanings.push(savedMeanings);
    } else {
      var total = data.savedMeanings;
      total.map((x) => {
        if (x.word == savedMeanings.word) {
          total = total.filter(function (item) {
            return item.word !== savedMeanings.word;
          });
        }
      });
      console.log(total, "tot");

      allMeanings = [...total, savedMeanings];
      console.log(allMeanings, "aaaaa");
    }
    User.updateOne(
      { _id: userid },
      {
        $set: {
          savedMeanings: allMeanings,
        },
      },
      { overwrite: false, new: true },
      function (err, res) {
        console.log(res, err);
      }
    );
    return res.json({ status: "ok", data: data.savedMeanings });
  });
});

app.post("/delete-word", async (req, res) => {
  const { userid, word } = req.body;
  console.log(userid, word);
  try {
    const user = User.findOne({ _id: userid }).then((data) => {
      let filteredArray = data.savedMeanings.filter(
        (value) => value.word !== word
      );
      console.log(filteredArray);
      User.updateOne(
        { _id: userid },
        {
          $set: {
            savedMeanings: filteredArray,
          },
        },
        { overwrite: false, new: true },
        function (err, res) {
          console.log(res, err);
        }
      );
    });

    // Books.deleteOne(
    //   {
    //     _id: userid,
    //   },
    //   function (err, res) {
    //     console.log(err, res);
    //   }
    // );
    return res.json({ status: "ok", data: user });
  } catch (error) {
    console.log(error);
  }
});

//authorDetails

require("./AuthorDetails");
const Author = mongoose.model("AuthorInfo");

app.post("/upload-author", async (req, res) => {
  const { image, name, description } = req.body;
  console.log(req.body, "body");
  try {
    const user = await Author.create({
      name,
      image,
      description,
    });
  } catch (error) {
    res.json({ status: "error", data: error });
  }
  res.json({ status: "ok" });
});

app.get("/get-author", async (req, res) => {
  try {
    Author.find({}).then((data) => {
      res.json({ data: data });
    });
  } catch (error) {
    res.json({ data: error });
  }
});

app.post("/delete-bookmark", async (req, res) => {
  const { userid, bookId } = req.body;

  try {
    const user = User.findOne({ _id: userid }).then((data) => {
      let filteredArray = data.bookmarked.filter(
        (value) => value.bookId._id !== bookId
      );
      console.log(filteredArray);
      User.updateOne(
        { _id: userid },
        {
          $set: {
            bookmarked: filteredArray,
          },
        },
        { overwrite: false, new: true },
        function (err, res) {
          console.log(res, err);
        }
      );
    });

    // Books.deleteOne(
    //   {
    //     _id: userid,
    //   },
    //   function (err, res) {
    //     console.log(err, res);
    //   }
    // );
    return res.json({ status: "ok", data: user });
  } catch (error) {
    console.log(error);
  }
});

//Admin
require("./AdminDetails");
const Admin = mongoose.model("AdminInfo");

app.post("/upload-admin", async (req, res) => {
  const { name, category } = req.body;
  console.log(req.body, "body");
  try {
    const user = await Admin.create({
      name,
      category,
    });
  } catch (error) {
    res.json({ status: "error", data: error });
  }
  res.json({ status: "ok" });
});

app.get("/get-admin", async (req, res) => {
  try {
    Admin.find({}).then((data) => {
      res.json({ data: data });
    });
  } catch (error) {
    res.json({ data: error });
  }
});

//bookRequest

require("./bookRequest");
const BookRequest = mongoose.model("BookRequest");
app.post("/send-response", async (req, res) => {
  const { email, book } = req.body;

  try {
    await BookRequest.create({
      email,
      book,
    });
  } catch (error) {
    res.json({ status: "error", data: error });
  }
  res.json({ status: "ok" });
});

//confirming that our node js server is started
app.listen(PORT, () => {
  console.log(`Connected to database on ${PORT} `);
});
