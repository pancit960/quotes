//admin interface and admin quote search
const express = require("express");
const salesAssociateController = require("../controllers/salesAssociateController");
const quoteController = require("../controllers/quoteController");
const orderController = require("../controllers/orderController");
const { authenticate, requireRole } = require("./middleware/auth");

const router = express.Router();

// router.use(authenticate);
router.use(requireRole("admin"));
//sales associate manager
router.get("/associates", salesAssociateController.getAll);
router.get("/associates/:id", salesAssociateController.getSingle);
router.post("/associates", salesAssociateController.create);
router.post("/associates/:id/edit", salesAssociateController.update);
router.get("/associates/delete/:id", salesAssociateController.remove);

//quote search/managing
router.get("/quotes", quoteController.adminSearch); // ?status=&dateFrom=&dateTo=&salesAssociateId=&legacyCustomerId=
router.delete("/quotes/:id", quoteController.adminDelete);

//all orders
router.get("/orders", orderController.getAll);

module.exports = router;
