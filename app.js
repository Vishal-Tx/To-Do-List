require('dotenv').config()
const https = require("https");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require('lodash');
const port=process.env.PORT || 3000


// //jquery
// var jsdom = require("jsdom");
// const { JSDOM } = jsdom;
// const { window } = new JSDOM();
// const { document } = (new JSDOM('')).window;
// global.document = document;
// var $ = require("jquery")(window);
// //

db_url = process.env.DB_URL
mongoose.connect(db_url);

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

const Item = mongoose.model("Item", itemSchema);

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const List = mongoose.model("List", listSchema)

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/public'))

app.set("view engine", "ejs");

// const items=["item 1", "item 2", "item 3"]
// const workItems=[];

const item1 = new Item({
  name: "Welcome to your todolist! ",
});

const item2 = new Item({
  name: "Hit the + button to add the new item",
});

const item3 = new Item({
  name: "Check the checkbox and press bin icon to delete an item.",
});

const defaultItems = [item1, item2, item3];

app.get("/", (req, res) => {
  //   let today = new Date("May 03, 2022");
  //   let currentDay = today.getDay();
  //   let currentDateDay = today.toString().slice(0, 3);
  // $("body").on("click", ()=>alert("hello"))

 


  let currentDay = date.getDate();

  Item.find((err, items) => {
    if (items.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) console.log(err);
        console.log("Successfully saved the default items to the DB.");
      });
    }
    if (err) console.log(err);
    res.render("list", { listTitle: currentDay, addedItem: items });
  });
});



app.post("/", async (req, res) => {
  // console.log(req.body);

 


  const itemName = req.body.userInput;
  const listName = req.body.list;

  console.log(itemName, listName);
  
    // items.push(item);
    const item = new Item({
      name: itemName
    });

    if(listName===date.getDate()){
      item.save();
    res.redirect("/");
    }
    else{
      List.findOne({name:listName},(err, foundList)=>{
        foundList.items.push(item)
        foundList.save();
        res.redirect("/add/"+listName)
      })
    }
    
  }
);

app.post("/delete", (req, res) => {
  // console.log(req.body);
  const deletedItemID = req.body.deleteItem;
const cheeckboxStatus = req.body.checkbox;
const listName = req.body.listName;
  console.log(listName);
    
if (listName === date.getDate()) {
  if (cheeckboxStatus) {
    Item.findByIdAndRemove(deletedItemID, function (err, docs) {
      if (err) {
        console.log(err);
      } else {
        console.log("Removed Item : ", docs);
        res.redirect("/");
      }
    });
  }
}

else{
  if(cheeckboxStatus) {
  List.findOneAndUpdate({name: listName}, {$pull: {items:{_id:deletedItemID}}}, (err, foundList)=>{
if(err)console.log("oops");
console.log(foundList);
res.redirect("/add/"+listName)
  })
}}

});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/add/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName) ;

  

  List.findOne({name: customListName}, (err, foundList)=>{
   
    if(!foundList){
      const list = new List({
        name: customListName,
        items: defaultItems
      });
    
      list.save();
      res.redirect("/add/"+customListName)
    }
    else{
      
      res.render("list", { listTitle: foundList.name, addedItem:foundList.items });
    }
  } )

  

  
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});





// document.querySelector("#checkbox").addEventListener("click", handleClick);

// function handleClick() {
//   alert("got clicked")
// }



// $( document ).ready(function() {
//   // Handler for .ready() called.
//   alert("hello");
// });


// window.onload = function() {
//   //YOUR JQUERY CODE
//   $(()=>{
//     alert("hello")
//   })
// }