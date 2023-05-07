const express = require("express");
const app = express();
const mongoose = require("mongoose");
const http = require('http');
const server = http.createServer(app);
const db = mongoose.connection;
var io = require('socket.io')(server, {
    cors: {
      origin: '*',
    }
});
db.on("error", (e) => console.error(e));
db.on("open", () => console.log("connected to db"));
app.use(express.json());
app.use(express.static("public"));
server.listen(process.env.PORT || 4000, () => {
  console.log("listening on 4000");
});
const schema = new mongoose.Schema({
  UID: String,
  account_balance: Number,
});
mongoose.set('strictQuery', true);
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://localhost/3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
const user = mongoose.model("users", schema);
mongoose.connect("mongodb+srv://Parimal:password147852@cluster0.1r1bcnt.mongodb.net/balance");
app.get("/", function (req, res) {
  res.json("Smart Canteen");
});
app.post("/getbalance", function (req, res) {
  let uid = req.body.uid;
  user.findOne({ UID: uid }, async(err, founduser) => {
    if (err) {
      console.log(err);
    } else {
      console.log(uid);
      if (founduser) {
         res.json(founduser.account_balance);       
      }
      else
         res.json("0");         
    }
  }
  );
});
app.post("/order", (req, res) => {
  let uid = req.body.uid;
  let amt = req.body.amt;
  user.updateOne(
    { UID: uid },
    { account_balance: amt },
    (err) => {
      if (err) console.error(err);
    }
  );

  res.json({"status":"Done","orderid":getorderid()});
  
});
  
app.post("/insert", (req, res) => {
  let uid = req.body.uid;
  let amt = req.body.amt;
  user.findOne({ UID: uid }, (err, founduser) => {
    if (err) {
      console.log(err);
    } else {
      if (founduser) {
        user.updateOne(
          { UID: uid },
          { account_balance: amt + founduser.account_balance },
          (err) => {
            if (err) console.error(err);
            else res.json("updated");
          }
        );
      } else {
        user.find({}, (err, fuser) => {
          const obj = new user({
            UID: uid,
            account_balance: amt,
          });
          obj.save();
          res.json("Newly inserted");
        });
      }
    }
  });
});
io.on('connection', (socket) => {
  console.log('A new client connected');
  socket.on('message', (data) => {
    console.log('Received message:', data);
    io.emit('message', data);
  });
  socket.on('disconnect', () => {
    console.log('A client disconnected');
  });
});

