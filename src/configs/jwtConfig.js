import jwt from "jsonwebtoken";

const jwtSign = (profileImg, idx, permission) => {
  const token = jwt.sign(
    {
      profileImg: profileImg,
      accountIdx: idx,
      permission: permission,
    },
    process.env.JWT_SECRET_KEY,
    {
      issuer: "stageus-kimyoungsun",
      expiresIn: "10h",
    }
  );

  return token;
};

export default jwtSign;
