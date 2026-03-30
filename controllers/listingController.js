const Listing = require("../models/Listing");
const Booking = require("../models/booking");

// =============================
// Constants & Helpers
// =============================
const DEFAULT_PLACEHOLDER_IMAGE = "https://via.placeholder.com/400x250?text=No+Image";
const DEFAULT_PLACEHOLDER_ITEM = { 
  url: DEFAULT_PLACEHOLDER_IMAGE, 
  filename: "placeholder.jpg" 
};

/**
 * Normalize listing images for safe rendering
 * Handles various legacy formats and ensures consistent structure
 */
const normalizeListingImages = (listing) => {
  if (!listing) return listing;

  // Handle legacy single image field
  if (!listing.images && listing.image) {
    if (typeof listing.image === 'object' && listing.image.url) {
      listing.images = [listing.image];
    } else if (typeof listing.image === 'string') {
      listing.images = [{ url: listing.image, filename: "uploaded.jpg" }];
    }
  }

  // Ensure images is array
  if (!Array.isArray(listing.images)) {
    listing.images = [];
  }

  // Filter out invalid entries and normalize
  listing.images = listing.images
    .filter(img => img && (img.url || (typeof img === 'string')))
    .map(img => {
      if (typeof img === 'string') {
        return { url: img, filename: "uploaded.jpg" };
      }
      return {
        url: img.url || DEFAULT_PLACEHOLDER_IMAGE,
        filename: img.filename || "uploaded.jpg"
      };
    });

  return listing;
};

/**
 * Convert multer files to image objects
 */
const processUploadedFiles = (files) => {
  if (!files || !Array.isArray(files) || files.length === 0) {
    return [];
  }

  return files
    .map(file => ({
      url: file.path || file.secure_url || file.url,
      filename: file.filename || file.originalname || "uploaded.jpg"
    }))
    .filter(img => img.url && img.url.trim() !== '');
};

// =============================
// 1️⃣ Show All Listings
// =============================
exports.getListings = async (req, res) => {
  try {
    let listings = await Listing.find({});

    if (!Array.isArray(listings)) {
      console.error("CRITICAL: listings is not an array:", typeof listings);
      listings = [];
    }

    listings = listings.map(listing => normalizeListingImages(listing));

    return res.render("listings/index", { listings });

  } catch (err) {
    console.error("Fetch Listings Error:", err.message);
    req.session.error = "Unable to load listings";
    return res.redirect("/");
  }
};

// =============================
// 2️⃣ Show Single Listing
// =============================
exports.showListing = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      req.session.error = "Invalid listing ID";
      return res.redirect("/listings");
    }

    const listing = await Listing.findById(id);

    if (!listing) {
      req.session.error = "Listing not found";
      return res.redirect("/listings");
    }

    normalizeListingImages(listing);

    return res.render("listings/show", { listing });

  } catch (err) {
    console.error("Show Listing Error:", err.message);
    req.session.error = "Error loading listing";
    return res.redirect("/listings");
  }
};

// =============================
// 3️⃣ Show Create Form
// =============================
exports.showForm = (req, res) => {
  res.render("listings/new");
};

// =============================
// 4️⃣ Search Listings
// =============================
exports.searchListings = async (req, res) => {
  try {
    const query = req.query.q;
    let listings = await Listing.find({
      title: { $regex: query, $options: "i" }
    });
    listings = listings.map(listing => normalizeListingImages(listing));
    res.render("listings/index", { listings });
  } catch (err) {
    console.error("Search Error:", err.message);
    req.session.error = "Error searching listings";
    res.redirect("/listings");
  }
};

// =============================
// 5️⃣ Create Listing
// =============================
exports.createListing = async (req, res) => {
  try {
    const { title, location, price, description, totalSeats, travelMode } = req.body;

    // Validate required fields
    if (!title || !location || !price) {
      req.session.error = "Title, location, and price are required";
      return res.redirect("/listings/new");
    }

    // Process uploaded images
    const uploadedImages = processUploadedFiles(req.files);
    const images = uploadedImages.length > 0 ? uploadedImages : [];

    // Validate and convert numeric fields
    const numPrice = Number(price);
    const numSeats = Number(totalSeats) || 40;

    if (numPrice <= 0) {
      req.session.error = "Price must be greater than 0";
      return res.redirect("/listings/new");
    }

    if (numSeats <= 0) {
      req.session.error = "Total seats must be greater than 0";
      return res.redirect("/listings/new");
    }

    const newListing = new Listing({
      title: title.trim(),
      location: location.trim(),
      price: numPrice,
      description: description ? description.trim() : "",
      travelMode: travelMode || "Train",
      totalSeats: numSeats,
      availableSeats: numSeats,
      images: images
    });

    await newListing.save();
    req.session.success = "Listing created successfully!";
    res.redirect("/listings");

  } catch (err) {
    console.error("Create Listing Error:", err.message);
    req.session.error = "Error creating listing. Please try again.";
    res.redirect("/listings/new");
  }
};

// =============================
// 6️⃣ Show Edit Form
// =============================
exports.editForm = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
      req.session.error = "Listing not found";
      return res.redirect("/listings");
    }

    normalizeListingImages(listing);

    res.render("listings/edit", { listing });

  } catch (err) {
    console.error("Edit Form Error:", err.message);
    req.session.error = "Error loading edit form";
    res.redirect("/listings");
  }
};

// =============================
// 7️⃣ Update Listing
// =============================
exports.updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, location, price, description, totalSeats, travelMode } = req.body;

    if (!title || !location || !price) {
      req.session.error = "Title, location, and price are required";
      return res.redirect(`/listings/${id}/edit`);
    }

    const updatedData = {
      title: title.trim(),
      location: location.trim(),
      price: Number(price),
      description: description ? description.trim() : "",
      travelMode: travelMode || "Train",
      totalSeats: Number(totalSeats) || 40
    };

    const existingListing = await Listing.findById(id);
    if (!existingListing) {
      req.session.error = "Listing not found";
      return res.redirect("/listings");
    }

    // Handle images: new files = replace, no files = keep existing
    const newImages = processUploadedFiles(req.files);

    if (newImages.length > 0) {
      // If new images uploaded, append to existing
      const existingImages = Array.isArray(existingListing.images)
        ? existingListing.images
        : [];
      updatedData.images = [...existingImages, ...newImages];
    } else {
      // Keep existing images
      updatedData.images = Array.isArray(existingListing.images)
        ? existingListing.images
        : [];
    }

    const updatedListing = await Listing.findByIdAndUpdate(id, updatedData, { new: true });

    if (!updatedListing) {
      req.session.error = "Listing not found";
      return res.redirect("/listings");
    }

    req.session.success = "Listing updated successfully!";
    res.redirect(`/listings/${id}`);

  } catch (err) {
    console.error("Update Listing Error:", err.message);
    req.session.error = "Error updating listing. Please try again.";
    res.redirect("/listings");
  }
};

// =============================
// 8️⃣ Delete Listing
// =============================
exports.deleteListing = async (req, res) => {
  try {
    const { id } = req.params;

    await Booking.deleteMany({ listing: id });
    console.log("Related bookings deleted");

    const listing = await Listing.findByIdAndDelete(id);

    if (!listing) {
      req.session.error = "Listing not found";
      return res.redirect("/listings");
    }

    req.session.success = "Listing deleted successfully!";
    res.redirect("/listings");

  } catch (err) {
    console.error("Delete Listing Error:", err.message);
    req.session.error = "Error deleting listing";
    res.redirect("/listings");
  }
};

// =============================
// 9️⃣ Show Booking Form
// =============================
exports.bookingForm = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
      req.session.error = "Listing not found";
      return res.redirect("/listings");
    }

    normalizeListingImages(listing);

    // Ensure availableSeats is set
    if (!listing.availableSeats || listing.availableSeats < 0) {
      listing.availableSeats = listing.totalSeats || 40;
    }

    res.render("listings/book", { listing });

  } catch (err) {
    console.error("Booking Form Error:", err.message);
    req.session.error = "Error loading booking page";
    res.redirect("/listings");
  }
};

exports.bookSeat = async (req, res) => {
  try {
    const { id } = req.params;

    const seats = Number(req.body.seats);
    const travelDate = new Date(req.body.date);

    const today = new Date();
    today.setHours(0,0,0,0);

    if (Number.isNaN(travelDate.getTime())) {
      req.session.error = "Please select a valid travel date";
      return res.redirect(`/listings/${id}/book`);
    }

    if (travelDate < today) {
      req.session.error = "Travel date cannot be in the past";
      return res.redirect(`/listings/${id}/book`);
    }

    const listing = await Listing.findById(id);

    if (!listing) {
      req.session.error = "Listing not found";
      return res.redirect("/listings");
    }

    if (!Number.isInteger(seats) || seats <= 0) {
      req.session.error = "Invalid seat number";
      return res.redirect(`/listings/${id}/book`);
    }

    if (listing.availableSeats <= 0 || seats > listing.availableSeats) {
      req.session.error = "Not enough seats available";
      return res.redirect(`/listings/${id}/book`);
    }

    // ✅ update seats
    await Listing.findByIdAndUpdate(id, {
      $inc: { availableSeats: -seats }
    });

    // ✅ save booking
    await Booking.create({
      user: req.session.userId,
      listing: id,
      name: req.body.name,
      phone: req.body.phone,
      seats: seats,
      totalPrice: seats * listing.price,
      bookingDate: new Date(),
      travelDate: travelDate
    });
    req.session.success = "Booking successful";

    res.redirect(`/listings/${id}`);

  } catch (err) {
    console.error("Booking Error:", err.message);
    req.session.error = "Unable to complete booking";
    res.redirect("/listings");
  }
};
