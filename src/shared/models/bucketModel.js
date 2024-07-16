import s3 from "../utils/awsConnect.js";
import path from "path";
import sendError from "../utils/sendError.js";
import CONSTANTS from "../utils/constansts.js";

const bucketModel = {
  insertMany: async ({ imgContents, bucketFolderPath }) => {
    try {
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

      return;
    } catch (err) {
      sendError({ message: CONSTANTS.MSG[500], status: 500, stack: err.stack });
    }

    return;
  },
  deleteMany: async ({ deletedBucketImgs }) => {
    try {
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

      return;
    } catch (err) {
      sendError({ message: CONSTANTS.MSG[500], status: 500, stack: err.stack });
    }
  },
  insertOne: async ({ imgContent, bucketFolderPath }) => {
    try {
      await s3.upload(
        {
          Bucket: process.env.AWS_BUCKETNAME,
          Key: path.join(bucketFolderPath, imgContent.fileName),
          Body: imgContent.buffer,
        },
        (err, data) => {
          if (err) {
            sendError({ message: CONSTANTS.MSG[500], status: 500, stack: err.stack });
          }
        }
      );

      return;
    } catch (err) {
      sendError({ message: CONSTANTS.MSG[500], status: 500, stack: err.stack });
    }

    return;
  },
  deleteOne: async ({ deletedBucketImgUrl }) => {
    try {
      s3.deleteObject(
        {
          Bucket: process.env.AWS_BUCKETNAME,
          Key: deletedBucketImgUrl,
        },
        (err) => {
          if (err) {
            reject(err);
          }
        }
      );

      return;
    } catch (err) {
      sendError({ message: CONSTANTS.MSG[500], status: 500, stack: err.stack });
    }
  },
};

export default bucketModel;
