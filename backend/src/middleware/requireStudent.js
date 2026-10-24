import jwt from "jsonwebtoken";
import Student from "../models/Student.js";
import { connectToMongo } from "../services/database.js";

export default async function requireStudent(req, res, next) {
  const secret = process.env.STUDENT_JWT_SECRET;
  const token = req.headers.cookie?.split(";").map((part) => part.trim()).find((part) => part.startsWith("ta_student_session="))?.slice("ta_student_session=".length);
  if (!secret || !token) return res.status(401).json({ error: "Please sign in to continue." });
  try {
    const claims = jwt.verify(token, secret, { algorithms: ["HS256"], issuer: "techalfa", audience: "techalfa-students" });
    await connectToMongo();
    const student = await Student.findById(claims.sub).select("name email college headline year city skills github linkedin avatarUrl createdAt +authVersion");
    if (!student || (claims.ver ?? 0) !== (student.authVersion || 0)) return res.status(401).json({ error: "Please sign in to continue." });
    req.student = student;
    return next();
  } catch (error) {
    if (error.name !== "JsonWebTokenError" && error.name !== "TokenExpiredError") console.error("Student session lookup failed:", error.message);
    return res.status(error.name === "JsonWebTokenError" || error.name === "TokenExpiredError" ? 401 : 503).json({ error: error.name === "JsonWebTokenError" || error.name === "TokenExpiredError" ? "Please sign in to continue." : "Student service is temporarily unavailable." });
  }
}
