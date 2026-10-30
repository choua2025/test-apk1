import express from "express";
import { getDataProducts } from "../controllers/product.js";
import {
  getDataCustomers,
  getCustomerList,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getDataOrders,
  getDataOrderItem,
} from "../controllers/customer.js";
const router = express.Router();

router.get("/products", getDataProducts);

// customers CRUD
router.get("/customers", getDataCustomers); // customers joined with orders/items
router.get("/customers/list", getCustomerList);
router.get("/customers/:id", getCustomerById);
router.post("/customers", createCustomer);
router.put("/customers/:id", updateCustomer);
router.patch("/customers/:id", updateCustomer);
router.delete("/customers/:id", deleteCustomer);

router.get("/orders", getDataOrders);
router.get("/order-items", getDataOrderItem);
export default router;
