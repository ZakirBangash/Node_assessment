const http = require("http");
const https = require("https");

module.exports = {
  callbackTask: async (req, res, next) => {
    const addresses = [].concat(req.query.address || []);
    const titles = [];

    const retreiveTitle = (address, callback, redirects = 0) => {
      if (!/^https?:\/\//i.test(address)) {
        address = `http://${address}`;
      }

      const protocol = address.startsWith("https") ? https : http;

      protocol
        .get(address, (response) => {
          if (
            response.statusCode >= 300 &&
            response.statusCode < 400 &&
            response.headers.location
          ) {
            const newAddress = new URL(response.headers.location, address).href;
            retreiveTitle(newAddress, callback, redirects + 1);
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
              callback();
            });
          }
        })

        .on("error", (error) => {
          titles.push(`${address} - "NO RESPONSE"`);
          callback();
        });
    };

    const handleAllRequests = (callback) => {
      let pendingRequests = addresses.length;

      const onTitleRetrieved = () => {
        pendingRequests--;
        if (pendingRequests === 0) {
          callback();
        }
      };

      addresses.forEach((address) => {
        retreiveTitle(address, onTitleRetrieved);
      });
    };

    const formatAndSendHTML = () => {
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

    handleAllRequests(formatAndSendHTML);
  },
};
