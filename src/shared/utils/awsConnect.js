import AWS from "aws-sdk";
import awsConfig from "../configs/awsConfig.js";

AWS.config.update(awsConfig);
const s3 = new AWS.S3();

export default s3;
