import {Request, Response} from "express";
import ProductService from "../services/productService.js";
import {ProductQueryParams} from "../interfaces/interfaces.js";

class ProductController {
  async getAllProducts(req: Request, res: Response) {
    try {
      const query = req.query as unknown as ProductQueryParams;

      const productsData = await ProductService.getAll(query);
      return res.json(productsData);
    } catch (error) {
      console.error("Error getting all products:", error);
      return res.status(500).json({error: "Internal server error."});
    }
  }

  async getProductById(req: Request, res: Response) {
    try {
      const product = await ProductService.getOne(req.params.id);
      if (!product) {
        return res.status(404).json({error: "Product not found."});
      }
      return res.json(product);
    } catch (error) {
      console.error("Error getting product by ID:", error);
      return res.status(500).json({error: "Internal server error."});
    }
  }

  async createProduct(req: Request, res: Response): Promise<Response> {
    try {
      const images = req.files?.images
        ? Array.isArray(req.files.images)
          ? req.files.images
          : [req.files.images]
        : [];
      const newProduct = await ProductService.create(req.body, images);
      return res.status(201).json(newProduct);
    } catch (error) {
      console.error("Error creating product:", error);
      return res.status(500).json({error: "Internal server error."});
    }
  }

  async updateProduct(req: Request, res: Response): Promise<Response> {
    try {
      const images = req.files?.images
        ? Array.isArray(req.files.images)
          ? req.files.images
          : [req.files.images]
        : [];
      const updatedProduct = await ProductService.update(
        req.body,
        req.params.id,
        images
      );
      if (!updatedProduct) {
        return res.status(404).json({error: "Product not found."});
      }
      return res.json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      return res.status(500).json({error: "Internal server error."});
    }
  }

  async deleteProduct(req: Request, res: Response): Promise<Response> {
    try {
      const deletedProduct = await ProductService.delete(req.params.id);
      if (!deletedProduct) {
        return res.status(404).json({error: "Product not found."});
      }
      return res.json(deletedProduct);
    } catch (error) {
      console.error("Error deleting product:", error);
      return res.status(500).json({error: "Internal server error."});
    }
  }
}

export default new ProductController();
