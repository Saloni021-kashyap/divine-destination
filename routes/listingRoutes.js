const express = require("express");
const router = express.Router();
const multer = require("multer");

const listingController = require("../controllers/listingController");
const { isLoggedIn, isAdmin } = require("../middleware/auth");
const { createCloudinaryStorage } = require("../config/cloudinary");

const multerUpload = (req, res, next) => {
  let storage;
  try {
    storage = createCloudinaryStorage();
  } catch (err) {
    console.error("Cloudinary storage init error:", err.message);
    req.session.error = "Image upload configuration error. Contact admin.";
    return res.redirect("/listings");
  }

  const upload = multer({ storage }).array("images", 5);

  upload(req, res, (err) => {
    if (err) {
      console.error("Image upload failed:", err.message);
      req.session.error = "Image upload failed. Please check file size/format.";
      return res.redirect("/listings");
    }
    next();
  });
};

// =============================
// 📌 ROUTES
// =============================

// 1️⃣ Show All Listings
router.get("/", listingController.getListings);

// search Listing
router.get("/search", listingController.searchListings);

// 2️⃣ Show Create Form
router.get("/new", isAdmin, listingController.showForm);

// 3️⃣ Create Listing
router.post(
  "/",
  isAdmin,
  multerUpload,
  listingController.createListing
);


// 4️⃣ Show Edit Form
router.get("/:id/edit", isAdmin, listingController.editForm);

// 5️⃣ Update Listing
router.put(
  "/:id",
  isAdmin,
  multerUpload,
  listingController.updateListing
);


// 6️⃣ Delete Listing
router.delete("/:id", isAdmin, listingController.deleteListing);

// ⭐ Booking Form
router.get("/:id/book", isLoggedIn, listingController.bookingForm);

// ⭐ Book Seats
router.post("/:id/book", isLoggedIn, listingController.bookSeat);


// 7️⃣ Show Single Listing (ALWAYS LAST)
router.get("/:id", listingController.showListing);

module.exports = router;
