const http = require("http");
const https = require("https");
const RSVP = require("rsvp");

module.exports = {
  promiseTask: async (req, res, next) => {
    const addresses = [].concat(req.query.address || []);
    const titles = [];

    const retreiveTitle = (address, redirects = 0) => {
      if (!/^https?:\/\//i.test(address)) {
        address = "http://" + address;
      }

      const protocol = address.startsWith("https") ? https : http;

      return new RSVP.Promise((resolve, reject) => {
        protocol
          .get(address, (response) => {
            if (
              response.statusCode >= 300 &&
              response.statusCode < 400 &&
              response.headers.location
            ) {
              const newAddress = new URL(response.headers.location, address)
                .href;
              if (redirects >= 5) {
                reject(new Error(`Too many redirects for ${address}`));
              }
              retreiveTitle(newAddress, redirects + 1)
                .then(resolve)
                .catch(reject);
            } else {
              let data = "";
              response.on("data", (chunk) => {
                data += chunk.toString();
              });

              response.on("end", () => {
                const titleMatch = data.match(/<title>([^<]*)<\/title>/i);
                titles.push(
                  titleMatch
                    ? `${address} - "${titleMatch[1]}"`
                    : `${address} - "NO RESPONSE"`
                );
                resolve();
              });
            }
          })
          .on("error", (error) => {
            titles.push(`${address} - "NO RESPONSE"`);
            reject(error);
          });
      });
    };

    const handleAllRequests = () => {
      const titlePromises = addresses.map((address) => retreiveTitle(address));
      return RSVP.all(titlePromises);
    };

    const formatAndSendHTML = () => {
      console.log("title:", titles);
      const html = `
              <html>
              <head></head>
              <body>
                  <h1>Following are the titles of given websites:</h1>
                  <ul>
                  ${titles.map((title) => `<li>${title}</li>`).join("\n")}
                  </ul>
              </body>
              </html>
          `;

      res.send(html);
    };

    handleAllRequests()
      .then(formatAndSendHTML)
      .catch((error) => {
        console.error(error);
        res.status(500).send("Internal Server Error");
      });
  },
};
