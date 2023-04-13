let express = require("express");
let passport = require("passport");
let jwt = require("jsonwebtoken");
let JWTStrategy = require("passport-jwt").Strategy;
let ExtractJwt = require("passport-jwt").ExtractJwt;
let app = express();
app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH,DELETE,HEAD"
  );
  res.header("Access-Control-Expose-Headers", "X-Auth-Token");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept,Authorization"
  );
  next();
});
var port = process.env.PORT || 2410;
app.use(passport.initialize());
app.listen(port, () => console.log(`Node app listening on port jai~ ${port}!`));
let fs = require("fs");
let fname = "furnitureData.json";
let flogin = "furnitureLoginData.json";

const { furnituredata, loginData } = require("./furnitureData.js");

const params = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: "jwtsecret10012000",
};

const jwtExpirySeconds = 1200;

let strategyAll = new JWTStrategy(params, async function (token, done) {
  console.log("INJWTStrategy", token);
  try {
    let data = await fs.promises.readFile(flogin, "utf-8");
    console.log(data);
    let obj = JSON.parse(data);
    let user = obj.find(
      (e) => e.email === token.email && e.password === token.password
    );
    if (!user) {
      return done(null, false, { message: "Incorrect username and password" });
    } else return done(null, user);
  } catch (err) {
    console.log(err);
  }
});

passport.use(strategyAll);

app.get("/svr/resetData", async function (req, res) {
  // console.log(furnituredata);
  let data = JSON.stringify(furnituredata);
  try {
    await fs.promises.writeFile(fname, data);
    res.send("resetData success");
  } catch (err) {
    res.send(err);
  }
});

app.get("/svr/resetLoginData", async function (req, res) {
  // console.log(furnituredata);
  let data = JSON.stringify(loginData);
  try {
    await fs.promises.writeFile(flogin, data);
    res.send("resetLoginData success");
  } catch (err) {
    res.send(err);
  }
});

app.get("/svr/products", async function (req, res) {
  try {
    let data = await fs.promises.readFile(fname, "utf-8");
    let obj = JSON.parse(data);
    res.send(obj);
  } catch (err) {
    res.send(err);
  }
});

app.get(
  "/products/:id",
  passport.authenticate("jwt", { session: false }),
  async function (req, res) {
    let id = req.params.id;
    console.log("ed",id)
    try {
      let data = await fs.promises.readFile(fname, "utf-8");
      let obj = JSON.parse(data);
      let fin = obj.find((e) => e.prodCode === id);
      res.send(fin);
    } catch (err) {
      res.send(err);
    }
  }
);

app.post("/login", async function (req, res) {
  let { email, password } = req.body;
  console.log(email, password);
  try {
    let data = await fs.promises.readFile(flogin, "utf-8");
    let obj = JSON.parse(data);
    let log = obj.find((e) => e.email === email && e.password === password);
    if (!log) {
      res.sendStatus(401);
    } else {
      let payload = { email: log.email, password: log.password };
      let token = jwt.sign(payload, params.secretOrKey, {
        algorithm: "HS256",
        expiresIn: jwtExpirySeconds,
      });
      res.setHeader("X-Auth-Token", token);
      // console.log(token);
      let it = { email: log.email, role: log.role, token: token };
      res.send(it);
    }
  } catch (err) {
    res.send(err);
  }
});

app.post(
  "/svr/products",
  passport.authenticate("jwt", { session: false }),
  async function (req, res) {
    let body = req.body;
    try {
      let data = await fs.promises.readFile(fname, "utf-8");
      let obj = JSON.parse(data);
      obj.push(body);
      let data1 = JSON.stringify(obj);
      try {
        await fs.promises.writeFile(fname, data1);
        res.send(body);
      } catch (err) {
        res.send(err);
      }
    } catch (err) {
      res.send(err);
    }
  }
);

app.put(
  "/svr/products/:id",
  passport.authenticate("jwt", { session: false }),
  async function (req, res) {
    let id = req.params.id;
    let body = req.body;
    try {
      let data = await fs.promises.readFile(fname, "utf-8");
      let obj = JSON.parse(data);
      let index = obj.findIndex((e) => e.prodCode === id);
      obj[index] = body;
      let data1 = JSON.stringify(obj);
      try {
        await fs.promises.writeFile(fname, data1);
        res.send(body);
      } catch (err) {
        res.send(err);
      }
    } catch (err) {
      res.send(err);
    }
  }
);

app.delete(
  "/svr/products/:id",
  passport.authenticate("jwt", { session: false }),
  async function (req, res) {
    let id = req.params.id;
    let body = req.body;
    try {
      let data = await fs.promises.readFile(fname, "utf-8");
      let obj = JSON.parse(data);
      let index = obj.findIndex((e) => e.prodCode === id);
      obj.splice(index, 1);
      let data1 = JSON.stringify(obj);
      try {
        await fs.promises.writeFile(fname, data1);
        res.send(body);
      } catch (err) {
        res.send(err);
      }
    } catch (err) {
      res.send(err);
    }
  }
);
