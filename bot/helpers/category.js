const { callbackDatas, actions } = require("../../constants");
const categoryModel = require("../../models/category.model");
const productModel = require("../../models/product.model");
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

  if (categories.length === 0) {
    page--;
    await userModel.findByIdAndUpdate(
      user._id,
      {
        action: `category-${page}`,
      },
      { new: true }
    );

    getAllCategories(chatId, page);
    return;
  }

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

const showCategory = async (chatId, categoryId, page = 1) => {
  const category = await categoryModel.findById(categoryId);
  const user = await userModel.findOne({ chatId });

  await userModel.findByIdAndUpdate(
    user._id,
    {
      action: `category_${categoryId}`,
    },
    { new: true }
  );

  let limit = 5;
  const skip = (page - 1) * limit;

  const products = await productModel
    .find({ category: categoryId })
    .skip(skip)
    .limit(limit);

  const lists = products.map((product) => [
    { text: product.title, callback_data: `product_${product._id}` },
  ]);

  const adminKeyboard = user.admin
    ? [
        [
          {
            text: "Yangi product",
            callback_data: `${callbackDatas.addProduct}_${category._id}`,
          },
        ],
        [
          {
            text: "Turkumni tahrirlash",
            callback_data: `edit_category-${category._id}`,
          },
          {
            text: "Turkumni o'chirish",
            callback_data: `delete_category-${category._id}`,
          },
        ],
      ]
    : [];

  const keyboards = user.admin ? adminKeyboard : [];

  bot.sendMessage(
    chatId,
    `${category.title} ga tegishli product lar ro'yxati`,
    {
      reply_markup: {
        remove_keyboard: true,
        inline_keyboard: [
          ...lists,
          [
            {
              text: "Ortga",
              callback_data: page > 1 ? callbackDatas.backProduct : page,
            },
            {
              text: `${page}`,
              callback_data: "0",
            },
            {
              text: "Keyingisi",
              callback_data:
                limit === products.length ? callbackDatas.nextProduct : page,
            },
          ],
          ...keyboards,
        ],
      },
    }
  );
};

const deleteCategory = async (chatId, categoryId) => {
  try {
    const user = await userModel.findOne({ chatId });
    const category = await categoryModel.findById(categoryId);

    if (!user.admin) {
      bot.sendMessage(chatId, "Sizga bunday so'rov mumkin emas!", {
        reply_markup: {
          keyboard: userKeyboard,
          resize_keyboard: true,
        },
      });
      return;
    }

    if (user.action !== "delete_category") {
      await userModel.findByIdAndUpdate(user._id, {
        action: "delete_category",
      });

      bot.sendMessage(
        chatId,
        `"${category.title}" kategoriyasini o'chirishni xohlaysizmi?`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Bekor qilish",
                  callback_data: `category_${categoryId}`,
                },
              ],
              [
                {
                  text: "O'chirish",
                  callback_data: `delete_category-${categoryId}`,
                },
              ],
            ],
          },
        }
      );
    } else {
      await productModel.deleteMany({ category: categoryId });
      await categoryModel.findByIdAndDelete(categoryId);

      bot.sendMessage(
        chatId,
        `"${category.title}" kategoriyasi o'chirildi! Menyuni tanlang!`
      );

      getAllCategories(chatId);
    }
  } catch (error) {
    console.log(error);
  }
};

const editCategory = async (chatId, categoryId) => {
  const user = await userModel.findOne({ chatId });
  const category = await categoryModel.findById(categoryId);

  if (!user.admin) {
    bot.sendMessage(chatId, "Sizga bunday so'rov mumkin emas!", {
      reply_markup: {
        keyboard: userKeyboard,
        resize_keyboard: true,
      },
    });
    return;
  }

  await userModel.findByIdAndUpdate(
    user._id,
    {
      action: `edit_category-${categoryId}`,
    },
    { new: true }
  );

  bot.sendMessage(chatId, `${category.title} Turkumga yangi nomni kiriting`);
};

const saveCategory = async (chatId, text) => {
  const user = await userModel.findOne({ chatId });
  const categoryId = user.action.split("-")[1];
  const category = await categoryModel.findById(categoryId);

  if (!user.admin) {
    bot.sendMessage(chatId, "Sizga bunday so'rov mumkin emas!", {
      reply_markup: {
        keyboard: userKeyboard,
        resize_keyboard: true,
      },
    });
    return;
  }

  await categoryModel.findByIdAndUpdate(categoryId, {
    title: text,
  });

  await userModel.findByIdAndUpdate(
    user._id,
    {
      action: `category_${categoryId}`,
    },
    { new: true }
  );

  bot.sendMessage(chatId, `${category.title} kategoriyasi tahrirlandi!`);

  getAllCategories(chatId);
};

module.exports = {
  getAllCategories,
  addCategory,
  newCategory,
  paginationCategory,
  showCategory,
  deleteCategory,
  editCategory,
  saveCategory,
};
