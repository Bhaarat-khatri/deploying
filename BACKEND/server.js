//express
const express = require("express");
const app = express();
//for path
const path = require("path");
//mongoose
const mongoose=require("mongoose");
//bodyparser for url request
const bodyparser = require("body-parser");
app.use(bodyparser.urlencoded(
    {
        extended:false
    }
))
app.use(bodyparser.json());

const { stringify } = require("querystring");
const { create } = require("domain");
//

//schemassss
const customer= mongoose.model("customerinfo",new mongoose.Schema({
    fullname : {
              type:String
             },
    email : {
                 type:String
             },
    city : {
        
                 type:String
             },
    currentbalance: {
                 type:String
            }
}));
 const TransactionHistory= mongoose.model("Transaction",new mongoose.Schema({
     sendername : {
               type:String
              },
     recievername: {
                  type:String
              },
     money : {
        
                  type:String
              }
}));
require("./mongodb/db");
//stattic files
app.use(express.static(path.join(__dirname, '../public')));
//port
const PORT = process.env.PORT 80;
//ejs
app.set("views",path.join(__dirname,"../All pages"))
app.set("view engine","ejs");



// connection work


app.get("/",(req,res)=>
{
    res.sendFile(path.join(__dirname,"../All pages/home.html"))
});

app.get("/transfer",(req,res)=>
{
    res.sendFile(path.join(__dirname,"../All pages/TRanssfer.html"))
});

app.get("/viewallcustomer",(req,res)=>
{
    customer.find((err,doc)=>
    {
        if(!err)
    {
        res.render("viewcustomer.ejs",
        {
            message: doc
        })
    }
    else
    {
        console.log("error at list")
    }
    console.log(doc);
})  
});

app.get("/:id",(req,res)=>
{
    console.log("i am here")
   
    customer.findById({ _id : req.params.id },(err,doc)=>
    {
        if(!err)
        {
            customer.find({ _id: { $ne: req.params.id } }).exec((errs, user) => {
       
               
                res.render("Personalinfo.ejs",{
                    info : doc,
                    every : user
                })
                
          
        })
        }
        
    })
  
});

app.post("/:id",(req,res)=>
{
    const sendamount = Number(req.body.amount);
    console.log(sendamount+" "+ req.body.name);
    customer.findById({_id : req.params.id},(err,doc)=>
    {
    
       var senderbalance = Number(doc.currentbalance);
       if(sendamount<=senderbalance)
       {
        senderbalance-=sendamount;
        doc.currentbalance=senderbalance;
        doc.save();
        customer.findOne({fullname:req.body.name},(errs,docs)=>
        {               
            
            var recieverbalance = Number(docs.currentbalance);
            recieverbalance+=sendamount;
            docs.currentbalance=recieverbalance;
            docs.save((err,doc)=>{
                if(!err)
                res.redirect("/viewallcustomer")
                else
                {
                    console.log("error during saving")
                }
            });
            var history = new TransactionHistory();
            history.sendername= doc.fullname;
            history.recievername = docs.fullname;
            history.money= req.body.amount;
            history.save();
        });
       }
       
       
    })
    

})


// app.get("/transfer/existingmember",(req,res)=>
// {
//     res.sendFile(path.join(__dirname,"../All pages/existinguser.html"))
// });

app.listen(PORT,()=>
{
    console.log("Your server is started at port"+PORT);
});
