const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { isLoggedIn } = require("../middleware/auth");

router.use(isLoggedIn);

router.get("/", bookingController.listBookings);
router.get("/:id/edit", bookingController.showEditBooking);
router.put("/:id", bookingController.updateBooking);
router.post("/:id/cancel", bookingController.cancelBooking);

module.exports = router;
