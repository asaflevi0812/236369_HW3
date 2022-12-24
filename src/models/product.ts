import * as mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    image: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema, "products");