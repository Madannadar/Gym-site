import dotenv from "dotenv";
dotenv.config();

const jwtConfig = {secretKey : process.env.ACCESS_TOKEN_SECRET;
refreshKey :  process.env.REFRESS_TOKEN_SECRET;
expiresIn : process.env.EXPIRES_IN;
OTPexpiresIn : process.env.OTP_EXPIRES_IN;
}

export default jwtConfig
