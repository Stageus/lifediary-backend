import express from "express";
import commentController from "../controllers/commentController.js";
import commentSchema from "../schema/commentSchema.js";
import validator from "../../../shared/middlewares/validator.js";

const commentRoute = express.Router();

commentRoute
  .get("/", validator(commentSchema.get), commentController.get)
  .post("/", validator(commentSchema.post), commentController.post)
  .post("/:parentCommentIdx/reply", validator(commentSchema.postReply), commentController.postReply)
  .put("/:commentIdx", validator(commentSchema.put), commentController.put)
  .delete("/:commentIdx", validator(commentSchema.delete), commentController.delete);

export default commentRoute;
