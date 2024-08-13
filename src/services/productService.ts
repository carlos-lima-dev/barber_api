import fileService from "../utils/fileService.js";
import productModel from "../models/productModel.js";
import {IProduct} from "../interfaces/interfaces.js";
import {ProductQueryParams} from "../interfaces/interfaces.js";

class ProductService {
  async getAll(query: ProductQueryParams) {
    const {category, minPrice, maxPrice, page = 1, limit = 10} = query;
    const filters: any = {};

    if (category) filters.category = category;
    if (minPrice) filters.price = {...filters.price, $gte: minPrice};
    if (maxPrice) filters.price = {...filters.price, $lte: maxPrice};

    const skip = (page - 1) * limit;

    const products = await productModel.find(filters).skip(skip).limit(limit);
    const total = await productModel.countDocuments(filters);

    return {products, total, page, limit};
  }

  async getOne(productId: string) {
    return await productModel.findById(productId);
  }

  async create(productData: any, imageFiles: any): Promise<IProduct> {
    try {
      const {title, price, description, category} = productData;

      let images = ["default-product.png"];
      if (imageFiles.length > 0) {
        images = await Promise.all(
          imageFiles.map((file: any) => fileService.save(file))
        );
      }

      const newProductData = {
        title,
        price,
        description,
        category,
        images,
      };

      const newProduct = await productModel.create(newProductData);

      return newProduct.toObject() as IProduct;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  }

  async update(
    productData: any,
    productId: string,
    imageFiles: any
  ): Promise<IProduct | undefined> {
    try {
      const {title, price, description, category} = productData;

      let updatedProduct = await productModel.findById(productId);

      if (!updatedProduct) {
        return undefined;
      }

      updatedProduct.title = title;
      updatedProduct.price = price;
      updatedProduct.description = description;
      updatedProduct.category = category;

      if (imageFiles && imageFiles.length > 0) {
        // Delete existing images except the default
        await Promise.all(
          updatedProduct.images
            .filter((img) => img !== "default-product.png")
            .map((img) => fileService.delete(img))
        );
        // Save new images
        updatedProduct.images = await Promise.all(
          Array.from(imageFiles).map((file) => fileService.save(file))
        );
      }

      await updatedProduct.save();

      return updatedProduct.toObject();
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  }

  async delete(productId: string): Promise<IProduct | undefined> {
    try {
      const deletedProduct = await productModel.findByIdAndDelete(productId);

      if (!deletedProduct) {
        return undefined;
      }

      // Delete the associated images from the server
      await Promise.all(
        deletedProduct.images
          .filter((img) => img !== "default-product.png")
          .map((img) => fileService.delete(img))
      );

      return deletedProduct.toObject();
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  }
}

export default new ProductService();
