import s3 from "../utils/awsConnect.js";
import path from "path";

const bucketModel = {
  insertMany: async ({ imgContents, bucketFolderPath }) => {
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
  },
  delete: ({}) => {},
  update: ({}) => {},
};

export default bucketModel;
