import { createServer } from "node:http";
import sgMail from "@sendgrid/mail";

const PORT = process.env.PORT || 3000;
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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
      const isSend = await sgMail.send({
        to: "programmerdev125@gmail.com",
        from: isBody.email,
        subject: isBody.subject,
        text: isBody.name + `\n` + isBody.message,
      });
      if (isSend) {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ success: "Email Sent Successfully" }));
      } else {
        res.writeHead(400, { "content-type": "application/json" });
        res.end(JSON.stringify({ error: "Error Sending Email" }));
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
