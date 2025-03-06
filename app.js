import { createServer } from "node:http";
import mongoose, { Schema } from "mongoose";
import mailer from "nodemailer";

const PORT = process.env.PORT || 3000;
const mongoUrl = process.env.MONGO_PUBLIC_URL;

const conn = mongoose.createConnection(mongoUrl);
const isCollection = conn.model(
  "ACustomModel",
  new Schema({
    id: { type: Number, unique: true, required: true },
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    message: { type: String, required: true },
  }),
  "emails"
);

const transport = mailer.createTransport({
  service: "Gmail",
  auth: {
    user: "programmerdev125@gmail.com",
    pass: "ytez etpu tnvh ogcu",
  },
});

const server = createServer((req, res) => {
  res.setHeader("access-control-allow-origin", "http://localhost:5173");
  res.setHeader("access-control-allow-methods", "GET, POST, OPTIONS");
  res.setHeader("access-control-allow-headers", "content-type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === "POST" && req.url === "/contact") {
    let isBody;
    req.on("data", (data) => {
      isBody = JSON.parse(data.toString());
    });
    req.on("end", async () => {
      const hasEmail = await isCollection.exists({
        email: { $regex: new RegExp(`^${isBody.email}$`, "i") },
      });
      if (hasEmail === null) {
        const isId = await isCollection.estimatedDocumentCount();
        const hasInserted = await isCollection.create({
          id: isId + 1,
          name: isBody.name,
          email: isBody.email,
          message: isBody.message,
        });

        if (hasInserted) {
          const hasMailSent = await transport.sendMail({
            to: isBody.email,
            from: process.env.EMAIL_USER,
            subject: "From. Abdul Ahad",
            text: "Hello! Your message have been received will contact you shortly after. From Abdul Ahad",
          });
          if (hasMailSent) {
            res.writeHead(201, {
              "content-type": "application/json",
            });
            res.end(
              JSON.stringify({ success: "Your mail has already been sent" })
            );
          }
        } else {
          res.writeHead(400, { "content-type": "application/json" });
          res.end(JSON.stringify({ error: "Failed to send message" }));
        }
      } else {
        res.writeHead(409, { "content-type": "application/json" });
        res.end(
          JSON.stringify({ error: "You've previously submitted an email" })
        );
      }
    });
  } else {
    res.writeHead(405, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "header not permitted" }));
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
