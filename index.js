const express = require("express");
const app = express();
const mongoose = require("mongoose");

const db = mongoose.connection;
db.on("error", (e) => console.error(e));
db.on("open", () => console.log("connected to db"));
app.use(express.json());
// app.use(express.static("public"));
app.listen(3000, () => {
  console.log("listening on 3000");
});
const schema = new mongoose.Schema({
  UID: String,
  account_balance: Number,
});
const user = mongoose.model("users", schema);
mongoose.connect("mongodb+srv://Parimal:password147852@cluster0.1r1bcnt.mongodb.net/balance");
app.get("/", function (req, res) {
  res.send("We are in");
});
app.post("/order", (req, res) => {
  let uid = req.body.uid;
  let order = req.body.order;
  user.findOne({ UID: uid }, async(err, founduser) => {
    if (err) {
      console.log(err);
    } else {
      if (founduser) {
        let orderid2 = getorderid();
        let orderamt = await getorderworth(order);
        console.log(orderamt);
        if (founduser.account_balance < orderamt)
          res.json("Insufficient balance");
        else {
          user.updateOne(
            { UID: uid },
            { account_balance: founduser.account_balance - orderamt },
            (err) => {
              if (err) console.error(err);
            }
          );

          res.json({"status":"Done","orderid":orderid2});
        }
      } else {
        res.json({"status":"no account found"});
      }
    }
  });
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
const getorderworth=(order)=>{
    // 1 samosa
    // 2 maggi
    //4 dosa
    //5 idli
    // 3 noodles
   let menu = new Map();
    menu.set(1,20);
    menu.set(2,25);
    menu.set(3,30);
    menu.set(4,35);
    menu.set(5,40);
    let sum =0;
    // console.log(order)
    for(let i in order)
    {
        //  console.log(order[i]["id"]+":"+order[i]["quantity"]);
        sum = sum +  (Number(menu.get(order[i]["id"])) * Number(order[i]["quantity"]));
    }
    return sum;
}
/*
order 
[
{
    "id":1,
    "quantity": 5
},
{
"id":2,
"quantity": 4
},
{
    "id":3,
    "quantity":1
}
]
*/
const getorderid=()=>{
   const t1 = Date.now() ;
   const t2 = new Date(t1);
   let hr = Number(t2.getHours())*3600;
   let min =  Number(t2.getMinutes())*60;
   let sec = Number(t2.getSeconds());
    return (hr+min+sec);
}