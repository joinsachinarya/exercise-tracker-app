const { all } = require("express/lib/application");
const mongoose = require("mongoose");
const { User } = require('./schema');

//function to add new user in mongodb database
const addNewUser=async(newUserName)=>{

    try {
        const newUser = new User({username:newUserName});
        //save the new user
        const newSavedUser=await newUser.save();
        return newSavedUser;

    } catch (e) {
        throw new Error("User could not be added in database!");
    }

};

const getAllUsers=async()=>{
    try {
        const allUsersArray= await User.find();
        return allUsersArray;
    } catch (e) {
        console.log(e);
        throw new Error("can not retrive user from database")
    }
};


//findeandUpdateUser function
const findandUpdateUser = async (userId, objWithNewProps)=>{
    try {
        const updatedUser = await User.findByIdAndUpdate(userId,
            {
              $push:{exercises : objWithNewProps}
            },
        {new:true});

        const objToReturn ={
            username:updatedUser.username,
            description:objWithNewProps.description,
            duration:objWithNewProps.duration,
            _id:userId,
            date:objWithNewProps.date
        };
        return objToReturn;
        
    } catch (e) {
        console.log(e);
        throw new Error ("User could not be updated");
    }
};

const addNewExercise=async (exerciseDetailsObj)=> {
    try {
        const objWithNewProps = {
            description : exerciseDetailsObj.description,
            duration : exerciseDetailsObj.duration,
            date : exerciseDetailsObj.date
        };
        const updatedUser = await findandUpdateUser(exerciseDetailsObj.id, objWithNewProps);
        if(updatedUser){
            const objToReturn={
                username:updatedUser.username,
                _id:updatedUser._id,
                description:updatedUser.description,
                duration: new Date(exerciseDetailsObj.date).toDateString()
            };
            return objToReturn;
        }
        else { return null; }

    } catch (e) {
        console.log(e);
        throw new Error(`exercise could not be saved in database : ${exerciseDetailsObj._id}`);
    }
}

const fetchExerciseLog = async (objReqRecieved)=>{
  //get all exercise  for this user 
  try {
      const thisUser =await User.findById(objReqRecieved.userId);
      let allExercise = null;

      if(thisUser && thisUser.exercises){
          allExercise= thisUser.exercises;
      }else{
          console.log(`user with id: ${objReqRecieved.userId} either does not exist or not have exercise array.`);
          return null;
      }

      if(objReqRecieved.fromDate && allExercise && allExercise.length>0){

        allExercise =allExercise.reduce(function(filtered,exercise){
            const fromDateFromParams = new Date(objReqRecieved.fromDate).getTime();
            const dateRitrieved = new Date(exercise.date).getTime();
            if(dateRitrieved>=fromDateFromParams){
                filtered.push(exercise);
            }
            return filtered;
        } ,[]);
      }

 
      if(objReqRecieved.toDate && allExercise && allExercise.length>0){

        allExercise =allExercise.reduce(function(filtered,exercise){
            const toDateFromParams = new Date(objReqRecieved.toDate).getTime();
            const dateRitrieved = new Date(exercise.date).getTime();
            if(dateRitrieved<=toDateFromParams){
                filtered.push(exercise);
            }
            return filtered;
        } ,[]);
      }


      ///making a  log  object containing exercise for this
      if(allExercise && allExercise.length>0)
      {
          allExercise = allExercise.map(exercise=>({
              description : exercise.description,
              duration:exercise.duration,
              date:exercise.date
              
          }));
      }


      //slice the array
      if(objReqRecieved && allExercise && allExercise.length>0){
         allExercise=allExercise.slice(0,objReqRecieved.limit);
      }

      const exerciseLogForThisUser ={
          username:thisUser.username,
          count:allExercise.length,
          _id:objReqRecieved.userId,
          log:allExercise
      };
      return exerciseLogForThisUser;

  } catch (e) {
      console.error(e);
      return null;
  }  
};


module.exports={
    addNewUser,
    getAllUsers,
    addNewExercise,
    fetchExerciseLog
};