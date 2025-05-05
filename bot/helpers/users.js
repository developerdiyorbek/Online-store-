const userModel = require("../../models/user.model");
const { bot } = require("../bot");
const { userKeyboard } = require("../menu/keyboard");

const getAllUsers = async (msg) => {
  try {
    const chatId = msg.chat.id;
    const user = await userModel.findOne({ chatId });

    if (user.admin) {
      const users = await userModel.find({});

      if (users.length === 0) {
        return bot.sendMessage(chatId, "Foydalanuvchilar topilmadi.");
      }

      let text = `📋 *Foydalanuvchilar ro'yxati:*\n\n`;

      users.forEach((u, i) => {
        const statusIcon = u.status ? "✅ Aktiv" : "❌ Bloklangan";
        const createdDate = new Date(u.createdAt).toLocaleString("uz-UZ");

        text +=
          `${i + 1}. *${u.name || "Nomaʼlum"}*\n` +
          `   📞 Telefon: \`${u.phone || "yoʻq"}\`\n` +
          `   🆔 Chat ID: \`${u.chatId}\`\n` +
          `   📅 Qo‘shilgan: ${createdDate}\n` +
          `   ⚙️ Holat: ${statusIcon}\n\n`;
      });

      bot.sendMessage(chatId, text, {
        parse_mode: "Markdown",
      });
    } else {
      bot.sendMessage(chatId, "Sizga bunday so'rov uyat bo'ladi 😂", {
        reply_markup: {
          keyboard: userKeyboard,
          resize_keyboard: true,
        },
      });
    }
  } catch (error) {}
};

module.exports = { getAllUsers };
