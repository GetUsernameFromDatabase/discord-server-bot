const Discord = require("discord.js");

const client = new Discord.Client();

class Identification {
  static Server = new Discord.Guild();

  static MyUser = new Discord.User(client, {
    username: "MiniGamer",
    discriminator: "4738",
    id: "186439588229677056",
    avatar: "24c90ae8f89d2b9989ba3cb4ff7e6eb1",
  });
}
exports.Identification = Identification;
exports.client = client;
