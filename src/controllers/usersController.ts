import {validationResult} from "express-validator";
import {JwtPayload} from "../interfaces/interfaces.js";
import fileService from "../utils/fileService.js";
import nodemailer from "nodemailer";
import {Request, Response} from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY || "";

class UserController {
  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await userModel.find();

      if (!users || users.length === 0) {
        return res.status(204).send("No users found");
      }

      return res.status(200).json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      return res.status(500).send("Internal Server Error");
    }
  }

  async getAllUsersById(req: Request, res: Response) {
    try {
      const user = await userModel.findById(req.params.id);

      if (!user) {
        return res.status(404).send("User not found");
      }

      return res.status(200).json(user);
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      return res.status(500).send("Internal Server Error");
    }
  }

  async updateUsers(req: Request, res: Response) {
    try {
      const userId = req.params.id;

      const existingUser = await userModel.findById(userId);

      if (!existingUser) {
        return res.status(404).json({error: "User not found"});
      }

      // Prepare the update data
      const updateData = {
        name: req.body.name || existingUser.name,
        email: req.body.email || existingUser.email,
        role: req.body.role || existingUser.role,
      };

      // Update the user
      const updatedUser = await userModel.findByIdAndUpdate(
        userId,
        updateData,
        {new: true}
      );

      return res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      return res.status(500).json({error: "Internal Server Error"});
    }
  }
  async deleteUser(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      const deletedUser: any = await userModel.findByIdAndDelete(userId);
      if (!deletedUser) {
        return res.status(404).json({error: "User not found."});
      }
      if (deletedUser.avatar !== "default.png") {
        fileService.delete(deletedUser.avatar);
      }
      return res.json({message: "User deleted successfully!"});
    } catch (error) {
      return res.status(500).json({error: "Internal Server Error."});
    }
  }

  async CreateUser(req: Request, res: Response) {
    const {name, email, password, role} = req.body;
    const foundUser = await userModel.findOne({email});
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({errors: errors.array()});
    }
    if (foundUser) {
      return res.status(409).json({error: "User already exists."});
    }
    let avatar = "default.png";
    if (req.files?.avatar) {
      avatar = fileService.save(req.files?.avatar);
    }
    const newUser = new userModel({
      name,
      email,
      password: bcrypt.hashSync(password.trim(), 7),
      avatar,
      role,
    });
    newUser.save();

    const payload = {
      id: newUser._id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    };
    const token = jwt.sign(payload, String(SECRET_KEY));
    return res.status(201).json({user: newUser, accessToken: token});
  }

  async LoginUser(req: Request, res: Response) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
      }

      const user = await userModel.findOne({email: req.body.email});

      if (!user) {
        return res.status(404).json({error: "User not found."});
      }

      const passwordMatch = await bcrypt.compare(
        req.body.password.trim(),
        user.password
      );

      if (passwordMatch) {
        // Exclude password from the user object
        const {password, ...userWithoutPassword} = user.toObject();

        const token = jwt.sign(
          {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          String(SECRET_KEY)
        );

        return res.json({user: userWithoutPassword, accessToken: token});
      } else {
        return res.status(400).json({error: "Invalid password."});
      }
    } catch (error) {
      console.error("Error logging in user:", error);
      return res.status(500).json({error: "Internal Server Error"});
    }
  }

  async AdminLogin(req: Request, res: Response) {
    try {
      // Valide os campos da solicitação, se necessário
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
      }

      // Encontre o usuário com base no e-mail fornecido na solicitação
      const user = await userModel.findOne({email: req.body.email});

      // Verifique se o usuário existe e se sua função é de administrador
      if (!user || user.role !== "ADMIN") {
        return res.status(404).json({error: "Admin not found."});
      }

      // Verifique se a senha fornecida corresponde à senha armazenada no banco de dados
      const passwordMatch = await bcrypt.compare(
        req.body.password.trim(),
        user.password
      );

      if (passwordMatch) {
        // Se a senha estiver correta, exclua a senha do objeto do usuário
        const {password, ...userWithoutPassword} = user.toObject();

        // Crie um token de acesso para o usuário
        const token = jwt.sign(
          {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          String(SECRET_KEY)
        );

        // Retorne o usuário (sem a senha) e o token de acesso como resposta
        return res.json({user: userWithoutPassword, accessToken: token});
      } else {
        // Se a senha estiver incorreta, retorne um erro
        return res.status(400).json({error: "Invalid password."});
      }
    } catch (error) {
      // Em caso de erro, retorne um erro interno do servidor
      console.error("Error logging in admin:", error);
      return res.status(500).json({error: "Internal Server Error"});
    }
  }
  async resetPassword(req: Request, res: Response) {
    const {email} = req.body;

    try {
      const user = await userModel.findOne({email});

      if (!user) {
        return res.status(404).json({error: "User not found"});
      }

      const token = jwt.sign({id: user._id}, SECRET_KEY, {expiresIn: "1h"});

      const transporter = nodemailer.createTransport({
        service: "gmail", // Example: use your email service provider
        auth: {
          user: process.env.GMAIL_USER, // Your email
          pass: process.env.GMAIL_PASS, // Your email password
        },
      });

      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: user.email,
        subject: "Password Reset",
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Password Reset Request</h2>
            <p>Hi ${user.name},</p>
            <p>You requested a password reset. Click the link below to set a new password:</p>
            <p>
              <a href="${req.protocol}://127.0.0.1:5173/update-password/${token}" 
                 style="display: inline-block; padding: 5px 10px; font-size: 14px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">
                Reset Password
              </a>
            </p>
            <p>If you did not request this, please ignore this email.</p>
            <p>Thank you,<br/>Your Company Team</p>
          </div>
        `,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
          return res.status(500).json({error: "Error sending email"});
        } else {
          console.log("Email sent:", info.response);
          return res.json({message: "Password reset email sent"});
        }
      });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({error: "Internal Server Error"});
    }
  }

  async updatePassword(req: Request, res: Response) {
    const {token, newPassword} = req.body;

    try {
      const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;

      if (!decoded || !decoded.id) {
        return res.status(400).json({error: "Invalid or expired token"});
      }

      const user = await userModel.findById(decoded.id);

      if (!user) {
        return res.status(404).json({error: "User not found"});
      }

      user.password = bcrypt.hashSync(newPassword, 7);
      await user.save();
      res.json({message: "Password updated successfully"});
    } catch (error) {
      console.error("Error updating password:", error);
      res.status(400).json({error: "Invalid or expired token"});
    }
  }
}

export default new UserController();
