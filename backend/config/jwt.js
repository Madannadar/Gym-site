import dotenv from "dotenv";
dotenv.config();

const jwtConfig = {
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  refreshTokenSecret: process.env.REFRESS_TOKEN_SECRET,
  tokenExpiry: process.env.EXPIRES_IN,
  OTPexpiresIn: process.env.OTP_EXPIRES_IN,
};

export default jwtConfig;

/*
{
    "success": true,
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoicHJvZmVzc2lvbmFsMDAxMjM0NUBnbWFpbC5jb20iLCJpYXQiOjE3NDg4NjIxNjksImV4cCI6MTc0OTQ2Njk2OX0.ZT4LrIdAfLh9Bdm8lMuO8xVYy0cwgabK2UbWQIxvImo",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImlhdCI6MTc0ODg2MjE2OSwiZXhwIjoxNzQ5NDY2OTY5fQ.38YBEF2a42Rp3w5Pya7pTXN4KciJn-iVFwuuT83XsYE",
    "expiresIn": 900,
    "user": {
        "id": 4,
        "email": "professional0012345@gmail.com",
        "firstName": "Pavan",
        "lastName": "Dhadge"
    }
}
*/
