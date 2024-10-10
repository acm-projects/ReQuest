// authentication.ts

import { getUsersByEmail, createUser } from '../db/users';
import { random, authentication } from '../helpers/index';
import { Request, Response } from 'express';

// Handle login logic
export const login = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.sendStatus(400); // Missing email or password
        }

        // Retrieve user by email and include authentication fields
        const user = await getUsersByEmail(email).select('+authentication.salt +authentication.password');
        
        if (!user) {
            return res.sendStatus(400); // User not found
        }

        // Check if authentication details are present
        if (!user.authentication || !user.authentication.salt || !user.authentication.password) {
            return res.sendStatus(400); // Missing authentication data
        }

        // Compare the provided password with the stored hash
        const expectedHash = authentication(user.authentication.salt, password);
        if (user.authentication.password !== expectedHash) {
            return res.sendStatus(403); // Invalid password
        }

        // Generate session token and save to user
        const salt = random();
        user.authentication.sessionToken = authentication(salt, user._id.toString());
        await user.save();

        // Set session token as a cookie
        res.cookie('ANTONIO-AUTH', user.authentication.sessionToken, { domain: 'localhost', path: '/' });
        return res.status(200).json(user).end();
    } catch (error) {
        console.error(error);
        return res.sendStatus(400);
    }
};

// Handle user registration logic
export const register = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { email, password, username } = req.body;

        if (!email || !password || !username) {
            return res.sendStatus(400); // Missing required fields
        }

        // Check if a user with the provided email already exists
        const existingUser = await getUsersByEmail(email);
        if (existingUser) {
            return res.sendStatus(400); // User already exists
        }

        // Create new user with salt and hashed password
        const salt = random();
        const user = await createUser({
            email,
            username,
            authentication: {
                salt,
                password: authentication(salt, password)
            }
        });

        return res.status(200).json(user).end();
    } catch (error) {
        console.error(error);
        return res.sendStatus(400);
    }
};
