const ImageKit = require("imagekit");
require('dotenv').config();



const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

async function uploadToImageKit(file, filename, folder = "/reports") {
  try {
    const response = await imagekit.upload({
      file: Buffer.isBuffer(file) ? file.toString("base64") : file,
      fileName: filename,
      folder: folder
    });
    return response;
  } catch (error) {
    console.error("Error uploading to ImageKit:", error);
    throw error;
  }
}

module.exports = uploadToImageKit;