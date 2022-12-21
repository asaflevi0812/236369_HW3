import * as mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    passwordHash: { type: String, required: true },
    permission: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);