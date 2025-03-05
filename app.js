import { createServer } from "node:http";

const data = [
  { id: 1, name: "John Doe" },
  { id: 2, name: "Jane Doe" },
  { id: 3, name: "Josh Doe" },
  { id: 4, name: "Joe Doe" },
];

const PORT = process.env.PORT || 3000;

const server = createServer((req, res) => {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-methods", "GET, POST");
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === "GET") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify(data));
  } else {
    res.writeHead(405, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "Incorrect Request Method" }));
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
