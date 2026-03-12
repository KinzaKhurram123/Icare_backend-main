const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorMiddlerware");
const swaggerUI = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
const agoraRoutes = require("./routes/agoraRoutes");

dotenv.config();
connectDB();
const app = express();
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/doctors", require("./routes/doctorRoutes"));
app.use("/api/paitents", require("./routes/patientsRoutes"));
app.use("/api/pharmacy/products", require("./routes/pharmacyProductsRoutes"));
app.use("/api/pharmacy/orders", require("./routes/pharmacyOrdersRoutes"));
app.use("/api/pharmacy", require("./routes/pharmacyRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/appointments", require("./routes/appointmentsRoutes"));
app.use("/api/reminders", require("./routes/remindersRoutes"));
app.use("/api/laboratories", require("./routes/laboratoryRoutes"));
app.use("/api/instructors", require("./routes/instructorRoutes"));
app.use("/api/instructors/courses", require("./routes/instructorCoursesRoutes"));
app.use("/api/instructors/precautions", require("./routes/instructorPrecautionsRoutes"));
app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/students/courses", require("./routes/studentCoursesRoutes"));
app.use("/api/medical-records", require("./routes/medicalRecordRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/prescription-templates", require("./routes/prescriptionTemplateRoutes"));
app.use("/api/test", require("./routes/testRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));
app.use("/api", agoraRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`),
);
