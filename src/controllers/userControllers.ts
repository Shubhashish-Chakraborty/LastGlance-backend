import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { loginValidationSchema, signupValidationSchema } from "../lib/zodSchema";
import prisma from "../db/prisma";
import { JWT_SECRET } from "../config";

export const signup = async (req: Request, res: Response) => {
    try {
        const result = signupValidationSchema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({
                message: 'Validation error',
                errors: result.error.flatten().fieldErrors,
            });
            return;
        }

        const { username, password } = result.data;

        const checkUser = await prisma.user.findUnique({
            where: {
                username
            }
        });

        if (checkUser) {
            res.status(400).json({
                message: `"${username}" is already taken. Please choose another username.`
            });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Store data in db:
        await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
            },
        });

        res.status(201).json({
            message: `${username} Successfully Registered!`,
            success: true
        });

    } catch (error) {
        console.error('Something Went Wrong during SignUp:', error);
        res.status(500).json({
            message: 'Something went wrong. Please try again later.'
        });
    }
};

export const login = async (req: Request, res: Response) => {
    try {

        const result = loginValidationSchema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({
                message: 'Validation error',
                errors: result.error.flatten().fieldErrors,
            });
            return;
        }

        const { username, password } = result.data;

        // check existence
        const user = await prisma.user.findUnique({
            where: {
                username
            }
        });

        if (!user) { // if doesn't exist
            res.status(401).json({
                message: 'User Not Found!'
            });
            return;
        }

        // password check:
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({
                message: 'Invalid Password, please try again.'
            });
            return;
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.username },
            JWT_SECRET,
            { expiresIn: '30d' },
        );

        res.status(200).json({
            message: 'Login successful',
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
            },
        });
    } catch (error) {
        console.error('Something Went Wrong during Login:', error);
        res.status(500).json({
            message: 'Something went wrong. Please try again later.'
        });
    }
};

