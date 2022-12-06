const Express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");

const serviceAccount = require("./firebase.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// const tokens = [];

const app = new Express();
const router = Express.Router();

app.use(bodyParser.json());
app.use("/", router);

app.listen(3000, () => {
  console.log(`Server started on port 3000`);
});

router.post("/register", (req, res) => {
  console.log('done');
  tokens.push(req.body.token);
  console.log(tokens,'tok');
  // res.status(200).json({ message: "Successfully registered FCM Token!" });
  res.send({message: "Successfully sent notifications!"})
});


router.post("/notifications", async (req, res) => {
  try {
    const {token, title, body, imageUrl } = req.body;
    const tokens=[]
    tokens.push(token)
    console.log(tokens,token);
    await admin.messaging().sendMulticast({
      tokens,
      notification: {
        title,
        body,
        imageUrl,
      },
    });
    res.send({message: "Successfully sent notifications!"})
    // res.status(200).json({ message: "Successfully sent notifications!" });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ message: err.message || "Something went wrong!" });
  }
});