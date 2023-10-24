import { PartialType } from "@nestjs/mapped-types"; // to make properites of user object optional
import { User } from "src/model/user.model";

export class UserUpdates extends PartialType(User) {

}