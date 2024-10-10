import express from 'express';
import {getUsersByEmail, createUser} from '../db/users';
import { random, authentication } from '../helpers';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cookieParser());  // Ensure you use this to parse cookies


export const login= async(req: any, res: any) => {
    try {
        const {email, password} = req.body;
        if(!email || !password) {
            return res.sendStatus(400);
        }

        const user = await getUsersByEmail(email).select('+authentication.salt +authentication.password');
        if(!user) {
            return res.sendStatus(400);
        } 
        const salt = random();
        const expectedHash = authentication(user.authentication.salt, password);
        if(user.authentication.password !=  expectedHash) {
            return res.sendStatus(403);
        } 
 
    user.authentication.sessionToken = authentication(salt, user._id.toString());
    await user.save();

    res.cookie('ANTONIO-AUTH', user.authentication.sessionToken, { domain: 'localhost', path: '/' })
        return res.status(200).json(user).end();
    
    } catch(error) {
           console.log(error);
           return res.sendStatus(400);
        }
    }

export const register = async(req: any, res: any) =>{
    try {
        const {email, password, username } = req.body;
        console.log(email);
        console.log(password);
        console.log(username);

        if (!email || !password || !username){
            return res.sendStatus(400);
        }

        const existingUser = await getUsersByEmail(email);

        console.log(existingUser);

        if (existingUser){
            return res.sendStatus(400)
        }

        const salt = random();
        const user = await createUser({
            email,
            username,
            authentication:{
                salt,
                password: authentication(salt, password)
            }
        })

        console.log(user);

        return res.status(200).json(user).end();  
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
}
