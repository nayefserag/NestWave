import { PartialType } from "@nestjs/mapped-types"; // to make properites of user object optional
import { Posts } from "src/model/posts.model";


export class PostUpdates extends PartialType(Posts) {


}