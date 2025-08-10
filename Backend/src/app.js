import express from "express";
import { createServer } from "node:http";
import { mongoose } from "mongoose";
import { connectToSocket } from "./controllers/socketManager.js";
import userRoutes from "./routes/userRoute.js"
import cors from "cors";
import dotenv from 'dotenv';
dotenv.config();

const app = express(); // express server
const server = createServer(app); // es server contains both servers i.e : app and socket.io
const io = connectToSocket(server);


const Uri = process.env.MONGO_URL;

// middlewares 
app.set("port",(process.env.PORT || 8080));
app.use(cors());
app.use(express.json({limit : "40kb"}));
app.use(express.urlencoded({limit:"40kb", extended : true}));

app.use("/api/v1/users", userRoutes);

const start = async()=>{
// connecting mongodb atals locally
    encodeURIComponent("kartik.2004.29#") 

    const connectionDb = await mongoose.connect(Uri);
    console.log(`MONGO IS CONNECTED TO THE HOST ${connectionDb.connection.host}`);
    
// the server is started, this server runs both "--- express sever ---" as well as "-- socket.io server ---"
    server.listen(app.get("port"),()=>{
        console.log(`the app is started on the port ${app.get("port")}`);
    })
}

start();


