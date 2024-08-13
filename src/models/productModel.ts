import mongoose, {Schema} from "mongoose";

export interface IProduct extends mongoose.Document {
  title: string;
  price: number;
  description: string;
  category: string;
  images: string[];
  rating?: {
    rate: number;
    count: number;
  };
}

const ProductsSchema = new Schema({
  title: {type: String, required: true},
  price: {type: Number, required: true},
  description: {type: String, required: true},
  category: {type: String, required: true},
  images: {type: [String], required: true, default: ["default.png"]},
  createdAt: {type: Date, default: Date.now},
});

export default mongoose.model<IProduct>("Product", ProductsSchema);
