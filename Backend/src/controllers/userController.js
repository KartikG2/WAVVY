import httpStatus from "http-status";
import { User } from "../models/userModel.js";
import bcrypt ,{hash} from "bcrypt";
import crypto  from "crypto";
import { Meeting } from "../models/meetingModel.js";


// ================== LOGIN =============================

const login = async (req,res)=>{
    const {username , password } = req.body;

    if(!username || !password){
            return res.status(400).json({message : "Please provide correct cridentials"})
    }
    try{
        const user = await User.findOne({username});
        if(!user){
           return res.status(httpStatus.NOT_FOUND).json({message : "User Not Found"});
        }
        let ispasswordCorrect = await bcrypt.compare(password , user.password);
        if(ispasswordCorrect){
            let token = crypto.randomBytes(20).toString("hex");

            user.token = token;
            await user.save();
            return res.status(httpStatus.OK).json({token: token})
        }else{
            return res.status(httpStatus.UNAUTHORIZED).json({message:"Invalid username or password"})
        }
    }
    catch(e){
        return res.status(500).json({message : `Something went wrong ${e}` })
    }
}


// ================================== REGISTER ====================

const register = async (req, res)=>{
    const {name, username, password} = req.body;

    try{
        const existingUser = await User.findOne({ username });
        if(existingUser){
            return res.status(httpStatus.FOUND).json({message : "User already exits"});
        }

        const hashedPassword = await bcrypt.hash(password,10);

        const newUser = new User({
            name:name,
            username:username,
            password : hashedPassword,
        })

        await newUser.save();

        res.status(httpStatus.CREATED).json({message : "User Registered"});
    }
    catch(e){
        res.json({message : "Something went wrong"});
    }
}



const getUserHistory = async (req, res) => {
    const { token } = req.query;

    try {
        const user = await User.findOne({ token: token });
        const meetings = await Meeting.find({ user_id: user.username })
        res.json(meetings)
    } catch (e) {
        res.json({ message: `Something went wrong ${e}` })
    }
}



const addToHistory = async(req,res)=>{
    const {token , meetingCode} = req.body;
    
    try {
        const user = await User.findOne({token:token});
        const newMeeting = new Meeting({
            user_id : user.username,
            meetingCode:meetingCode
        })

        await newMeeting.save();
        
        res.status(httpStatus.CREATED).json({message:"Added code to history"});
    } catch (error) {
        res.json({message:`Something went wrong ${error}`})
    }
}



export {login,register,getUserHistory,addToHistory};