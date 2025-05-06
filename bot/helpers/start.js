const { actions } = require("../../constants");
const userModel = require("../../models/user.model");
const { bot } = require("../bot");
const { adminKeyboard, userKeyboard } = require("../menu/keyboard");

const start = async (msg) => {
  const chatId = msg.chat.id;

  const checkUser = await userModel.findOne({ chatId });

  if (!checkUser) {
    await userModel.create({
      name: msg.from.first_name,
      chatId,
      admin: false,
      status: true,
      action: actions.requestContact,
    });

    bot.sendMessage(
      chatId,
      `Assalomu alaykum, hurmatli ${msg.from.first_name}. Iltimos telefon raqamingizni ulashing!`,
      {
        reply_markup: {
          keyboard: [
            [
              {
                text: "Telefon raqamni yuborish!",
                request_contact: true,
              },
            ],
          ],
          resize_keyboard: true,
        },
      }
    );
  } else {
    await userModel.findByIdAndUpdate(
      checkUser._id,
      {
        action: actions.menu,
      },
      {
        new: true,
      }
    );

    bot.sendMessage(
      chatId,
      `Menyuni tanlang ${checkUser.admin ? "Admin" : checkUser.name}`,
      {
        reply_markup: {
          keyboard: checkUser.admin ? adminKeyboard : userKeyboard,
          resize_keyboard: true,
        },
      }
    );
  }
};

const requestContact = async (msg) => {
  const chatId = msg.chat.id;

  if (msg.contact.phone_number) {
    const user = await userModel.findOneAndUpdate(
      { chatId },
      {
        phone: msg.contact.phone_number,
        admin: msg.contact.phone_number == "998936221907",
        action: actions.menu,
      },
      { new: true }
    );

    bot.sendMessage(
      chatId,
      `Menyuni tanlang ${user.admin ? "Admin" : user.name}`,
      {
        reply_markup: {
          keyboard: user.admin ? adminKeyboard : userKeyboard,
          resize_keyboard: true,
        },
      }
    );
  }
};

module.exports = { start, requestContact };
