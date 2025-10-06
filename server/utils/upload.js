// utils/upload.js
const ImageKit = require("imagekit");
require("dotenv").config();

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

/**
 * Upload a file buffer or base64 string to ImageKit.
 * @param {Buffer|string} file - File buffer or base64 string.
 * @param {string} filename - Original filename or custom name.
 * @param {string} [folder="/reports"] - Destination folder in ImageKit.
 * @returns {Promise<{url: string, fileId: string, thumbnailUrl?: string}>}
 */
async function upload(file, filename, folder = "/reports") {
  try {
    const uploadResponse = await imagekit.upload({
      file: Buffer.isBuffer(file) ? file.toString("base64") : file,
      fileName: filename,
      folder,
      useUniqueFileName: true,
    });

    return {
      url: uploadResponse.url,
      thumbnailUrl: uploadResponse.thumbnailUrl || uploadResponse.thumbnail || null,
      fileId: uploadResponse.fileId,
    };
  } catch (error) {
    console.error("Error uploading to ImageKit:", error?.message || error);
    throw new Error("Image upload failed");
  }
}

module.exports = upload;
