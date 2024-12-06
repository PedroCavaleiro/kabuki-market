import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../schema/user";
import { sendVerificationEmail } from "../controllers/user";

const createAdminUser = async (mail) => {
  const existingAdmin = await User.findOne({ username: "admin" }).lean();
  if (!existingAdmin) {
    const created = Date.now();

    const hash = await bcrypt.hash("admin", 10);

    const adminUser = new User({
      username: "admin",
      email: process.env.KM_ADMIN_EMAIL,
      role: "admin",
      password: hash,
      created,
      remainingInvites: Number.MAX_SAFE_INTEGER,
      emailVerified: process.env.KM_DISABLE_EMAIL,
    });
    adminUser.uid = crypto
      .createHash("sha256")
      .update(adminUser._id.toString())
      .digest("hex")
      .slice(0, 10);
    adminUser.token = jwt.sign(
      {
        id: adminUser._id,
        created,
        role: "admin",
      },
      process.env.KM_JWT_SECRET
    );

    await adminUser.save();

    if (!process.env.KM_DISABLE_EMAIL) {
      const emailVerificationValidUntil = created + 48 * 60 * 60 * 1000;
      const emailVerificationToken = jwt.sign(
        {
          user: process.env.KM_ADMIN_EMAIL,
          validUntil: emailVerificationValidUntil,
        },
        process.env.KM_JWT_SECRET
      );
      await sendVerificationEmail(
        mail,
        process.env.KM_ADMIN_EMAIL,
        emailVerificationToken
      );
    }

    console.log("[km] created initial admin user");
  }
};

export default createAdminUser;
