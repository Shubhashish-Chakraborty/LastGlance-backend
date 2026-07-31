import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { signupValidationSchema } from "../lib/zodSchema";
import prisma from "../db/prisma";

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

        // user existence:
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

        // store data in db:
        const newUser = await prisma.user.create({
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
}

