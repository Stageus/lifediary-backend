import s3 from "../utils/awsConnect.js";
import path from "path";
import sendError from "../utils/sendError.js";
import CONSTANTS from "../utils/constansts.js";

const bucketModel = {
  insertMany: async ({ imgContents, bucketFolderPath }) => {
    try {
      console.log("hah");
      await Promise.all(
        imgContents.map((img) => {
          return new Promise((resolve, reject) => {
            s3.upload(
              {
                Bucket: process.env.AWS_BUCKETNAME,
                Key: path.join(bucketFolderPath, img.fileName),
                Body: img.buffer,
              },
              (err, data) => {
                if (err) reject(err);
                else resolve(data);
              }
            );
          });
        })
      );

      console.log(2);
      return;
    } catch (err) {
      sendError({ message: CONSTANTS.MSG[500], status: 500, stack: err.stack });
    }

    return;
  },
  deleteMany: async ({ deletedBucketImgs }) => {
    try {
      console.log(1);
      await new Promise((resolve, reject) => {
        s3.deleteObjects(
          {
            Bucket: process.env.AWS_BUCKETNAME,
            Delete: {
              Objects: deletedBucketImgs.map((imgUrl) => {
                return { Key: imgUrl };
              }),
            },
          },
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      console.log(2);
      return;
    } catch (err) {
      sendError({ message: CONSTANTS.MSG[500], status: 500, stack: err.stack });
    }
  },
  deleteFolder: async ({ folderPath }) => {
    try {
      const { Contents: imgUrls } = await new Promise((resolve, reject) => {
        s3.listObjects(
          {
            Bucket: process.env.AWS_BUCKETNAME,
            Prefix: folderPath,
          },
          (err, data) => {
            if (err) reject();
            else resolve(data);
          }
        );
      });

      if (imgUrls.length === 0) {
        return;
      }

      await new Promise((resolve, reject) => {
        s3.deleteObjects(
          {
            Bucket: bucketName,
            Delete: {
              Objects: imgUrls.map((img) => {
                return { Key: img.Key };
              }),
            },
          },
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      return;
    } catch (err) {
      sendError({ message: CONSTANTS.MSG[500], status: 500, stack: err.stack });
    }
  },
};

export default bucketModel;
