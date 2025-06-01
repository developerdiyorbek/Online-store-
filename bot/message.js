const { actions, callbackDatas } = require("../constants");
const userModel = require("../models/user.model");
const { bot } = require("./bot");
const {
  getAllCategories,
  newCategory,
  saveCategory,
} = require("./helpers/category");
const { start, requestContact } = require("./helpers/start");
const { getAllUsers } = require("./helpers/users");

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  const user = await userModel.findOne({ chatId });

  if (text === "/start") {
    start(msg);
  }

  if (user) {
    if (user.action === actions.requestContact && !user.phone) {
      requestContact(msg);
    }

    if (text === "Foydalanuvchilar") {
      getAllUsers(msg);
    }

    if (text === "Katalog") {
      getAllCategories(chatId);
    }

    if (user.action === callbackDatas.addCategory) {
      newCategory(msg);
    }

    if (user.action.includes("edit_category-")) {
      saveCategory(chatId, text);
    }
  }
});
