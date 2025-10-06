const bcrypt =  require("bcryptjs");
const User = require("./models/User"); 
const dotenv = require("dotenv");

dotenv.config();

const registerAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ role: "state_admin" });
    if (existingAdmin) {
      console.log("Admin already exists");
    } else {

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("Admin54673289", salt);

    await User.create({
      name: "Director Pharmaceutical Services",
      email: "dps@dtp.com",
      password: hashedPassword,
      hospital: "HQ",
      role: "state_admin",
      approved: true
    });

    console.log("👑 Admin seeded successfully!");
  }} 
   catch (err) {
    console.error(err);
    process.exit(1);
  }
};

module.exports = registerAdmin;
