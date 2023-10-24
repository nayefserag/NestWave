import { PartialType } from "@nestjs/mapped-types"; // to make properites of user object optional
import { Comment } from "src/model/comment.model";

export class CommentUpdates extends PartialType(Comment) {

}