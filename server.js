require("dotenv").config();
const express = require("express");
const mongoose = require ("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require ("express-rate-limit");
const connectDB = require("./config/db");

/*Import Routes & Middleware*/

const invoiceRoutes = require('./routes/invoiceRoutes');
const summaryRoutes = require('./routes/summaryRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

/*Middleware to handle CORS   */ 
app.use(
    cors({
        origin:"*",
        methods: ["GET","POST","PUT","DELETE"],
        allowedHeaders: ["Content-Type","Authorization"],
    })
);

/* Connect Database */
connectDB();

/*Body Parser Middleware */
app.use(express.json());

/*Security Middleware */
app.use(helmet());

/*Logging Middleware */
app.use(morgan("dev"));



/*Start Server */
const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>console.log(`Server running on port ${PORT}`));
