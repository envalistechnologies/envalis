import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import compression from "compression";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import { seedSuperAdmin } from "./seed/seedSuperAdmin.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import { requestLogger } from "./middleware/requestLogger.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import articleRoutes from "./routes/articleRoutes.js";
import portfolioRoutes from "./routes/portfolioRoutes.js";
import caseStudyRoutes from "./routes/caseStudyRoutes.js";
import testimonialRoutes from "./routes/testimonialRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import careerRoutes from "./routes/careerRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

dotenv.config();

const app = express();

app.set("trust proxy", 1);

// Connect DB
connectDB().then(() => {
  if (process.env.NODE_ENV === "development") {
    seedSuperAdmin().catch((err) =>
      console.error("Seed error:", err.message)
    );
  }
});

const allowedOrigins = [
  "https://envalis-admin.vercel.app",
  "https://envalis.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.ADMIN_URL || "http://localhost:5174"
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
// Express 5 no longer accepts "*" as a route pattern; app.use(cors(...))
// already handles preflight requests globally.


// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(compression());

// Rate limit (disabled in production for Vercel)
if (process.env.NODE_ENV === "development") {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
      success: false,
      message: "Too many requests, please try again later."
    },
  });
  app.use("/api", limiter);

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: {
      success: false,
      message: "Too many login attempts, please try again later."
    },
  });
  app.use("/api/auth/login", authLimiter);
  app.use("/api/auth/forgot-password", authLimiter);
  app.use("/api/auth/reset-password", authLimiter);
}

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logger
app.use(requestLogger);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Health route
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Envalis Technologies API is running",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/portfolios", portfolioRoutes);
app.use("/api/case-studies", caseStudyRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/careers", careerRoutes);
app.use("/api/emails", emailRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

// Start server (only listen in development)
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV === "development") {
  app.listen(PORT, () => {
    console.log(`Envalis Technologies Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  });
}

export default app;