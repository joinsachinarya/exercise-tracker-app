const {addNewUser,getAllUsers,addNewExercise,fetchExerciseLog}=require('./db.js');
require("dotenv").config();
const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const listener =app.listen(process.env.PORT || 3000, ()=> {
    console.log("app is listening at "+ listener.address().port);    
});

// open the index.html when client side hit the root end of API
app.use(express.static('public'));
app.get('/', (req, res)=>{
    res.sendFile(__dirname + '/views/index.html');
});

//body-parser
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());



//connect to mongodb
const mongoose = require("mongoose");
const db=mongoose.connect(process.env.uri,(err)=>{
    if(err) console.error(err);
    console.log("connected to mdb");
});

//crate a new user after getiing data from client side form
app.post('/api/users', async function(req,res,next){
    //console.log(req.body.username);// body: [Object: null prototype] { username: 'username' }
    const userName = req.body.username;
    if(!userName || userName.length===0){
        return res.json({error:"invalid username"});
    }else{
        try {
            const newUser =await addNewUser(userName);;
            console.log(newUser);
            res.json({
                username:newUser.username,
                _id: newUser._id,

            })
        } catch (e) {
            console.error(e);
        }
    }
})

//get a list of all users
app.get('/api/users',async(req,res,next)=>{
    try {
        const allUsers=await getAllUsers();
        res.json(allUsers);
    } catch (e) {
        console.log(e);
    }
})
//create exercise for an existing user
app.post('/api/users/:_id/exercises', async function(req,res,next){
    const userId = req.params._id ||  req.body._id;
    const todaysDate=new Date();
    const yyyy = todaysDate.getFullYear();
    const m = todaysDate.getMonth()+1;
    const d = todaysDate.getDate();
    const dateStr = yyyy + "-" +  (m<=9 ? '0' +m:m) + "-" + (d<=9? '0' +d:d);

    const datePartOnly = req.body.date ? req.body.date:dateStr;
    try {
        const newExercise = await addNewExercise({
            id:userId,
            description:req.body.description,
            duration:req.body.duration,
            date:datePartOnly
        });
        if(newExercise){
            res.json(newExercise);
        }else{
            console.log(newExercise);
            res.end();
        }
    } catch (e) {
        console.error(e);
    }
});

//retrieve log of all exercise of a user
app.get('/api/users/:_id/logs', async function(req,res, next){
    const userId=req.params["_id"];
    const {from, to, limit} = req.query;
    const objToProcess ={
        userId:userId,
        fromDate:from,
        toDate:to,
        limit:limit
    };
    try {
        const exerciseLog = await fetchExerciseLog(objToProcess);
        if(exerciseLog){
            res.json(exerciseLog);
        }else{
            console.log(exerciseLog);
            res.end();
        }
        
    } catch (e) {
        console.error(e);
    }
})