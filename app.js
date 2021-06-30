const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todoListDB",{ useNewUrlParser: true , useUnifiedTopology: true});
const itemsSchema={
  name:String
};

const Item=mongoose.model("Item",itemsSchema);
const item1=new Item({
  name:"Welcome to ToDo list"
})
const item2=new Item({
  name:"Hit the + button to add a new item"
})
const item3=new Item({
  name:"<-- Hit this to remove an item"
})

const defaultItems=[item1,item2,item3];

const listSchema= {
  name:String,
  items:[itemsSchema]
}
const List=mongoose.model("List",listSchema);

app.get("/", function(req, res) {
  Item.find(function(err,result){
    if(result.length===0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }
      })
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: result});
    }
  })


});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName =req.body.list;
  const item4=new Item({
    name:itemName
  })
  if(listName==="Today"){
    item4.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,result){
      result.items.push(item4);
      result.save();
      res.redirect("/"+listName);
    })
  }

});

app.post("/delete",function(req,res){
  const checkedItemId=_.capitalize(req.body.checkbox);
  const listName=req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndRemove({_id:checkedItemId},function(err){
      if(!err){
        res.redirect("/");
      }
    })
  }else{
    List.findOneAndUpdate({name: listName},{$pull :{items:{_id:checkedItemId}}},function(err,result){
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }
})

app.get("/:customListName", function(req,res){
  const customListName=req.params.customListName;
  List.findOne({name:customListName},function(err,result){
    if(!err){
      if(!result){
        const list=new List({
          name: customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+ customListName);
      }
      else{
        res.render("list", {listTitle: result.name, newListItems: result.items});
      }
    }
  })

});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
