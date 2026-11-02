import express from "express";
import authenticate from "../../middlewares/authenticate.js";
import validate from "../../middlewares/validate.js";
import * as controller from "./customer.controller.js";
import { customerBody, customerIdParams } from "./customer.schema.js";

const router = express.Router();

// All customer endpoints require login
router.use(authenticate);

router.get("/", controller.list);
router.get("/:id", validate({ params: customerIdParams }), controller.get);
router.post("/", validate({ body: customerBody }), controller.create);
router.put("/:id", validate({ params: customerIdParams, body: customerBody }), controller.update);
router.delete("/:id", validate({ params: customerIdParams }), controller.remove);

export default router;
