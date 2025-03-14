// Complete Events Exercise
const { EventEmitter } = require("events");
const path = require("path");
const http = require("http");
const fs = require("fs");

const NewsLetter = new EventEmitter();
const port = 3000;

NewsLetter.on("signup", (contact) => {
  fs.appendFile(
    "./newsletter.csv",
    `${contact.name},${contact.email}\n`,
    (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log(`Added ${contact.name} to newsletter list.`);
      }
    }
  );
});

const server = http.createServer((req, res) => {
  const { url, method } = req;
  const chunks = [];
  req.on("data", (chunk) => chunks.push(chunk));
  req.on("end", () => {
    if (url == "/newsletter_signup" && method == "POST") {
      let reqBody;
      try {
        reqBody = JSON.parse(Buffer.concat(chunks).toString());
        console.log(reqBody);
      } catch (err) {
        console.log(reqBody);
        console.log(err);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.write(
          JSON.stringify({
            msg: "You did not provide the correct request body details",
          })
        );
        res.end();
        return;
      }

      NewsLetter.emit("signup", reqBody);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.write(JSON.stringify({ msg: "Signup successful" })); // Add response message
      res.end();
    } else if (url == "/newsletter_signup" && method == "GET") {
      fs.readFile("./index.html", (err, contents) => {
        let response = contents,
          contentType = "text/html",
          status = 200;
        if (err) {
          console.error(err);
          status = 500;
          response = "<h1>Server Error</h1>";
        }
        res.writeHead(status, { "Content-Type": contentType });
        res.write(response);
        res.end();
      });
    } else {
      res.writeHead(404, { "Content-Type": "text/html" });
      res.write("<h1>404 Page Not Found</h1>");
      res.end();
    }
  });
});
server.listen(port, () => console.log(`server is listening on port ${port}`));
