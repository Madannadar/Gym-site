// import { generateAccessAndRefreshToken } from "../helper/generateAccessAndRefreshToken.js";
import jwt from "jsonwebtoken";

// signup a new user
const signUp = async (req, res) => {
  try {
    // Destructure the user's data from the request body
    const { name, email, password } = req.body;

    // Check if all fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
        status: 400,
        success: false,
      });
    }

    // Check if the user already exists
    const userExist = await getUserByemail(email); //implement this
    if (userExist) {
      return res.status(400).json({
        message: "User already exists",
        status: 400,
        success: false,
      });
    }

    // Check for minimum password length
    // apply pass check here
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
        status: 400,
        success: false,
      });
    }

    // Apply email regex
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format",
        status: 400,
        success: false,
      });
    }

    // Create a new user
    // const newUser = new User({ name, email, password });
    // await newUser.save();
    //make new user here
    const newUser = await createNewUser(name, email, password);
    // fetch user information
    const user = await getUserById(newUser.id);

    // Send back the created user's information
    return res.status(201).json({
      message: "User registered successfully",
      user,
      status: 201,
      success: true,
    });
  } catch (error) {
    console.error("error while registering a user", error);
    return res.status(500).json({
      message: "Error while registering a user",
      error: error.message,
      status: 500,
      success: false,
    });
  }
};
