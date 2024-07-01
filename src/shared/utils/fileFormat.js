import path from "path";
import { v4 } from "uuid";

const fileFormat = (files) => {
  return !files
    ? null
    : files.map((file) => {
        return {
          fileName: v4() + path.extname(file.originalname),
          originalName: file.originalname,
          buffer: file.buffer,
        };
      });
};

export default fileFormat;
