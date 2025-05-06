const { callbackDatas, actions } = require("../../constants");
const categoryModel = require("../../models/category.model");
const userModel = require("../../models/user.model");
const { bot } = require("../bot");
const { userKeyboard } = require("../menu/keyboard");

const getAllCategories = async (chatId, page = 1) => {
  const user = await userModel.findOne({ chatId });

  const limit = 5;
  const skip = (page - 1) * limit;

  if (page == 1) {
    await userModel.findByIdAndUpdate(
      user._id,
      {
        action: "category-1",
      },
      { new: true }
    );
  }

  const categories = await categoryModel.find().skip(skip).limit(5);

  const lists = categories.map((category) => [
    { text: category.title, callback_data: `category_${category._id}` },
  ]);

  bot.sendMessage(chatId, "Kategoriyalar ro'yxati", {
    reply_markup: {
      remove_keyboard: true,
      inline_keyboard: [
        ...lists,
        [
          {
            text: "Ortga",
            callback_data: page > 1 ? callbackDatas.backCategory : page,
          },
          {
            text: `${page}`,
            callback_data: "0",
          },
          {
            text: "Keyingisi",
            callback_data:
              limit === categories.length ? callbackDatas.nextCategory : page,
          },
        ],
        user.admin
          ? [
              {
                text: "Yangi kategoriya",
                callback_data: callbackDatas.addCategory,
              },
            ]
          : [],
      ],
    },
  });
};

const addCategory = async (chatId) => {
  let user = await userModel.findOne({ chatId });

  if (user.admin) {
    await userModel.findByIdAndUpdate(
      user._id,
      {
        action: callbackDatas.addCategory,
      },
      { new: true }
    );

    bot.sendMessage(chatId, "Kategoriya nomini kiriting");
  } else {
    bot.sendMessage(chatId, "Sizga bunday so'rov mumkin emas!", {
      reply_markup: {
        keyboard: userKeyboard,
        resize_keyboard: true,
      },
    });
  }
};

const newCategory = async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  const user = await userModel.findOne({ chatId });

  if (user.admin && user.action === callbackDatas.addCategory) {
    await userModel.findByIdAndUpdate(
      user._id,
      {
        action: callbackDatas.addCategory,
      },
      { new: true }
    );

    await categoryModel.create({
      title: text,
    });

    await userModel.findByIdAndUpdate(user._id, {
      action: actions.category,
    });

    getAllCategories(chatId);
  } else {
    bot.sendMessage(chatId, "Sizga bunday so'rov mumkin emas!", {
      reply_markup: {
        keyboard: userKeyboard,
        resize_keyboard: true,
      },
    });
  }
};

const paginationCategory = async (chatId, action) => {
  const user = await userModel.findOne({ chatId });
  let page = 1;

  if (user.action.includes("category-")) {
    page = +user.action.split("-")[1];

    if (action === callbackDatas.backCategory && page > 1) {
      page--;
    }
  }

  if (action === callbackDatas.nextCategory) {
    page++;
  }

  await userModel.findByIdAndUpdate(
    user._id,
    {
      action: `category-${page}`,
    },
    { new: true }
  );

  getAllCategories(chatId, page);
};

module.exports = {
  getAllCategories,
  addCategory,
  newCategory,
  paginationCategory,
};
