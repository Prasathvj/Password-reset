import mongoose from "mongoose";

export function dbConnection(){
    const params = {
        useNewUrlParser:true,
        useUnifiedTopology:true,
    }
    try {
        mongoose.connect("mongodb+srv://prasath123:prasath123@cluster3.l9ziclu.mongodb.net/Users",params)
        console.log("Database connected Succesfully")
    } catch (error) {
        console.log("Error connecting DB")
    }
}


