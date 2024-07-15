import express from "express";
import commentController from "../controllers/commentController.js";
import commentSchema from "../schema/commentSchema.js";
import validator from "../../../shared/middlewares/validator.js";
import auth from "../../../shared/middlewares/auth.js";

const commentRoute = express.Router();

commentRoute
  .get("/", validator(commentSchema.get), commentController.get)
  .post("/", auth, validator(commentSchema.post), commentController.post)
  .post("/:parentCommentIdx/reply", auth, validator(commentSchema.postReply), commentController.postReply)
  .put("/:commentIdx", auth, validator(commentSchema.put), commentController.put)
  .delete("/:commentIdx", auth, validator(commentSchema.delete), commentController.delete);

export default commentRoute;
