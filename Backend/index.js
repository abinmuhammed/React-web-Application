const express = require("express");
const cors = require("cors");
require("./db/config");

const User = require("./db/User");

const jwt = require("jsonwebtoken");
const jwtkey = "ecom";

const products = require("./db/products");

const app = express();
app.use(express.json());
app.use(cors());

function verifyToken(req,res,next){
  let token =req.headers['authorization'];
  console.log(token);
  if(token){
    token=token.split(' ')[1];
  jwt.verify(token,jwtkey,(err,valid)=>{
  if(err){
    console.log(err,"90");
    res.status(401).send({result:"please provide a vaid token"})
  }else{
    
    next();
  }
})
  }else{
    res.status(403).send({result:"provide a token"})
  }
}

app.post("/register", async (req, res) => {
  let user = new User(req.body);
  let result = await user.save();
  result = result.toObject();
  delete result.password;
  jwt.sign({ result }, jwtkey, { expiresIn: "2h" }, (err, token) => {
    if (err) {
      res.send({ result: "something went wrong" });
    } else {
      console.log("here123");

      res.send({ result, auth: token });
      console.log("456");
    }
  });
  console.log(req.body);
});

app.post("/login", async (req, res) => {
  let user = await User.findOne(req.body).select("-password");
  console.log(req.body);
  if (req.body.password && req.body.email) {
    if (user) {
      jwt.sign({ user }, jwtkey, { expiresIn: "2h" }, (err, token) => {
        if (err) {
          res.send({ result: "something went wrong" });
        } else {
          console.log("here123");

          res.send({ user, auth: token });
          console.log("456");
        }
      });
    } else {
      res.send({ result: "user not found" });
    }
  } else {
    res.send({ result: "user not found" });
  }
});

app.post("/addproduct",verifyToken, async (req, res) => {
  let product = new products(req.body);
  let result = await product.save();
  res.send(result);
});

app.get("/products",verifyToken, async (req, res) => {
  console.log("su---cess");
  const result = await products.find();
  if (result.length > 0) {
    console.log("789");
    res.send(result);
    console.log(result);
  } else {
    res.send("No products found...");
  }
});

app.delete("/product/:id",verifyToken, async (req, res) => {
  let result = await products.deleteOne({ _id: req.params.id });
  res.send(result);
});

app.get("/update/:id",verifyToken, async (req, res) => {
  let result = await products.findOne({ _id: req.params.id });
  if (result) {
    res.send(result);
  } else {
    res.send("not found");
  }
});

app.put("/update/:id",verifyToken, async (req, res) => {
  console.log("789")
  let result = await products.updateOne(
    {
      _id: req.params.id,
    },
    {
      $set: req.body,
    }
  );
  res.send(result);
});


app.get("/users", async (req, res) => {
  console.log("su---cess");
  const result = await User.find();
  if (result.length > 0) {
    console.log("789");
    res.send(result);
    console.log(result);
  } else {
    res.send("No products found...");
  }
});

app.get("/search/:key",async(req,res)=>{
  let result =await products.find({
    "$or":[
      {
        name:{$regex:req.params.key}
      },
      {
        company:{$regex:req.params.key}
      },
      {
        category:{$regex:req.params.key}
      }
    ]
  })
  res.send(result)
})




app.listen(5000);
