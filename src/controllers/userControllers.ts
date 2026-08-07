import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { loginValidationSchema, signupValidationSchema } from "../lib/zodSchema";
import prisma from "../db/prisma";
import { JWT_SECRET } from "../config";
import { AuthRequest } from "../middlewares/userAuthentication";

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
            { id: user.id, username: user.username },
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

export const changeUsername = async (req: AuthRequest, res: Response) => {
  try {
    const { username } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized.' });
      return;
    }

    if (username) {
      if (username.length < 3) {
        res.status(400).json({ message: 'Username must be at least 3 characters.' });
        return;
      }
      const existing = await prisma.user.findUnique({ where: { username } });
      if (existing && existing.id !== userId) {
        res.status(400).json({ message: 'Username is already taken.' });
        return;
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { ...(username && { username }) },
      select: { id: true, username: true },
    });

    res.status(200).json({ success: true, user: updated });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Failed to update profile.' });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ message: 'Unauthorized!' });
            return;
        }

        if (!currentPassword || !newPassword) {
            res.status(400).json({ message: 'Current and new passwords are required.' });
            return;
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            res.status(404).json({ message: 'User not found.' });
            return;
        }

        const passwordMatch = await bcrypt.compare(currentPassword, user.password);
        if (!passwordMatch) {
            res.status(401).json({ message: 'Current password is incorrect.' });
            return;
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword },
        });

        res.status(200).json({ success: true, message: 'Password changed successfully!' });
    } catch (error) {
        console.error('Change Password Error:', error);
        res.status(500).json({ message: 'Failed to change password.' });
    }
}