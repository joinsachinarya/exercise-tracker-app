const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
{    

    username:{
        type:String,
        required:true,
        unique:false
    },

    exercises:[
    {
        discription:String, // shortcut for {type:String}
        duration:{type:Number},
        date:{
            type:String,
            required:false
        }
    }
  ]
},

{versionKey:false}

);

//crating a model
const User=mongoose.model('User',userSchema);
exports.User=User; //export User so that we can use it in tother module of project