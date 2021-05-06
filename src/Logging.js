/* eslint-disable no-console */
const { client } = require("./Identification");

class Logging {
  static Greet() {
    console.log(`Logged in as ${client.user.tag}!`);
  }

  static Error(err, description = "") {
    if (description !== "") {
      console.error(description);
    }
    console.error(err);
    console.error();
  }

  static Log(msg) {
    console.log(msg);
  }
}
exports.Logging = Logging;
