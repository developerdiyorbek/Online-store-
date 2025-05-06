const { callbackDatas } = require("../constants");
const { bot } = require("./bot");
const { addCategory, paginationCategory } = require("./helpers/category");

bot.on("callback_query", async (query) => {
  const { data } = query;
  const chatId = query.from.id;

  console.log(data);

  if (data === callbackDatas.addCategory) {
    addCategory(chatId);
  }

  if ([callbackDatas.nextCategory, callbackDatas.backCategory].includes(data)) {
    paginationCategory(chatId, data);
  }
});
