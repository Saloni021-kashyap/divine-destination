const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_KEY;
const apiSecret = process.env.CLOUDINARY_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  const missingVars = [
    !cloudName ? "CLOUDINARY_CLOUD_NAME" : null,
    !apiKey ? "CLOUDINARY_KEY" : null,
    !apiSecret ? "CLOUDINARY_SECRET" : null,
  ].filter(Boolean);

  console.warn(
    `Cloudinary not fully configured. Missing: ${missingVars.join(", ")}`
  );
} else {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

const createCloudinaryStorage = () => {
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials are not configured properly.");
  }

  return new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "DivineDestination",
      allowed_formats: ["jpg", "png", "jpeg"],
    },
  });
};

module.exports = {
  cloudinary,
  createCloudinaryStorage,
};
