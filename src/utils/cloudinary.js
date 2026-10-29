if (!CLOUD_NAME || !UPLOAD_PRESET) {
  console.error("Cloudinary configuration check:", {
    hasCloudName: Boolean(CLOUD_NAME),
    hasUploadPreset: Boolean(UPLOAD_PRESET),
  });

  throw new Error(
    "Cloudinary is not configured. Check your environment variables."
  );
}