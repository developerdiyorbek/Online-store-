const { callbackDatas } = require("../constants");
const { bot } = require("./bot");
const {
  addCategory,
  paginationCategory,
  showCategory,
  deleteCategory,
  editCategory,
} = require("./helpers/category");

bot.on("callback_query", async (query) => {
  const { data } = query;
  const chatId = query.from.id;

  if (data === callbackDatas.addCategory) {
    addCategory(chatId);
  }

  if ([callbackDatas.nextCategory, callbackDatas.backCategory].includes(data)) {
    paginationCategory(chatId, data);
  }

  if (data.includes("category_")) {
    showCategory(chatId, data.split("_")[1]);
  }

  if (data.includes("delete_category-")) {
    deleteCategory(chatId, data.split("-")[1]);
  }

  if (data.includes("edit_category-")) {
    editCategory(chatId, data.split("-")[1]);
  }
});
