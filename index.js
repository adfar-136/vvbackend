import { fileURLToPath } from "url";
import { dirname } from "path";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose"
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import path from "path"
import { UserRouter } from './routes/userrouter.js';
import { MernDataRouter } from './routes/mernDataRouter.js';
import { TopicContentRouter } from './routes/topicContentRouter.js';
import { DocsRouter } from "./routes/DocsRouter.js";
import { DiscussionRouter } from "./routes/discussionRouter.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
app.use(bodyParser.json())
dotenv.config();

app.use(express.json());
app.use(cors({
  origin:["http://localhost:3001"],
  credentials:true
}));
mongoose.connect("mongodb+srv://adfarrasheed136:variable@cluster0.vaizt.mongodb.net/variableverse?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
  });
app.use(cookieParser());
app.use("/auth",UserRouter)
app.use("/mern",MernDataRouter)
app.use("/content",TopicContentRouter)
app.use("/docs",DocsRouter)
app.use("/discussions",DiscussionRouter)


  app.use(express.static(path.join(__dirname, '/builddd')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname+'/builddd/index.html'));
  });
app.listen(process.env.PORT,()=>{
    console.log("Server is running on port 3000")
})