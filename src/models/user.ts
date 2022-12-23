import * as mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    permission: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema, "users");