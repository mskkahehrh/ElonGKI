const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const config = require('../settings')

const databaseFolder = path.join(__dirname, 'database');

if (!fs.existsSync(databaseFolder)) {
  fs.mkdirSync(databaseFolder);
}

const settingsSchema = new mongoose.Schema({
  BOT_JID: { type: String, default: "", index: true },   // ← NEW: each bot's unique identifier
  OWNER_NUMBER: { type: String, default: "94781332957" },
  MV_SIZE: { type: String, default: "0" },
  NAME: { type: String, default: "" },
  JID: { type: String, default: "" },
  SEEDR_MAIL: { type: String, default: "" },
  SEEDR_PASSWORD: { type: String, default: "" },
  LANG: { type: String, default: "EN" },
  SUDO: { type: [String], default: [] },
  JID_BLOCK: { type: [String], default: [] },
  ANTI_BAD: { type: [String], default: [] },
  MAX_SIZE: { type: Number, default: 500 },
  ANTI_CALL: { type: String, default: "false" },
  AUTO_READ_STATUS: { type: String, default: "false" },
  AUTO_VIEW_STATUS: { type: String, default: "false" },
  AUTO_LIKE_STATUS: { type: String, default: "false" },
  AUTO_BLOCK: { type: String, default: "false" },
  AUTO_STICKER: { type: String, default: "false" },
  AUTO_VOICE: { type: String, default: "false" },
  AUTO_REACT: { type: String, default: "true" },  
  CMD_ONLY_READ: { type: String, default: "true" },
  WORK_TYPE: { type: String, default: "private" },
  XNXX_BLOCK: { type: String, default: "true" },
  AUTO_MSG_READ: { type: String, default: "false" },
  AUTO_TYPING: { type: String, default: "false" },
  AUTO_RECORDING: { type: String, default: "false" },
  AUTO_WELCOME_LEAVE: { type: [String], default: [] },
  ANTI_LINK: { type: String, default: "false" },
  ANTI_BOT: { type: String, default: "false" },
  ALIVE: { type: String, default: "default" },
  PREFIX: { type: String, default: "." },
  CHAT_BOT: { type: String, default: "false" },
  ALLWAYS_OFFLINE: { type: String, default: "false" },
  MV_BLOCK: { type: String, default: "true" },
  BUTTON: { type: String, default: "false" },
  ACTION: { type: String, default: "delete" },
  ANTILINK_ACTION: { type: String, default: "delete" },
  VALUSE: { type: [String], default: [] },
  LOGO: { 
    type: String, 
    default: "https://raw.githubusercontent.com/Nethmika-LK/Shala-MD-Database/refs/heads/main/image/BOT_NAME.jpg" 
  },
  MAINMENU: { 
    type: String, 
    default: "https://i.ibb.co/mV9Hthsh/temp-1762331502295.jpg" 
  },
  GROUPMENU: { 
    type: String, 
    default: "https://i.ibb.co/mV9Hthsh/temp-1762331502295.jpg" 
  },
  OWNERMENU: { 
    type: String, 
    default: "https://i.ibb.co/YBTJ7k4v/temp-1762328278526.jpg" 
  },
  CONVERTMENU: { 
    type: String, 
    default: "https://i.ibb.co/YBTJ7k4v/temp-1762328278526.jpg" 
  },
  AIMENU: { 
    type: String, 
    default: "https://i.ibb.co/YBTJ7k4v/temp-1762328278526.jpg" 
  },
  LOGOMENU: { 
    type: String, 
    default: "https://i.ibb.co/YBTJ7k4v/temp-1762328278526.jpg" 
  },
  DOWNMENU: { 
    type: String, 
    default: "https://i.ibb.co/YBTJ7k4v/temp-1762328278526.jpg" 
  },
  SEARCHMENU: { 
    type: String, 
    default: "https://i.ibb.co/YBTJ7k4v/temp-1762328278526.jpg" 
  },
  OTHERMENU: { 
    type: String, 
    default: "https://i.ibb.co/YBTJ7k4v/temp-1762328278526.jpg" 
  },
  MOVIEMENU: { 
    type: String, 
    default: "https://i.ibb.co/YBTJ7k4v/temp-1762328278526.jpg" 
  },
  ANTI_DELETE: { type: String, default: "off" },
  LEAVE_MSG: { type: String, default: "" },
  AUTO_STATUS_REACT: { type: String, default: "true" },
  CUSTOM_REACT: { type: String, default: "" },
  AUTO_REPLY: { type: String, default: "true" },
  AUTO_AI: { type: String, default: "true" },
  OWNER_REACT: { type: String, default: "true" },
});

// Unique index: one settings document per bot JID
settingsSchema.index({ BOT_JID: 1 }, { unique: true });

const Settings = mongoose.model(config.MONGO_DB, settingsSchema);

// ─────────────────────────────────────────────
// BOT_JID management
// Each bot instance stores its JID in config.BOT_JID after pairing.
// All DB operations use this JID as the filter key.
// ─────────────────────────────────────────────

function getBotJid() {
  return config.BOT_JID || '';
}

async function connectdb() {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log("Database connected 🛢️");

    // If no BOT_JID yet (first startup before pairing), do nothing more.
    // initSettingsForBot() will be called once the socket connects.
  } catch (error) {
    console.error(" ├ Database connection error:", error);
  }
}

// Called after the bot connects and we know its JID.
async function initSettingsForBot(botJid) {
  if (!botJid) return;
  const existing = await Settings.findOne({ BOT_JID: botJid });
  if (!existing) {
    await Settings.create({ BOT_JID: botJid });
    console.log(`Settings initialized for bot: ${botJid} ✅`);
  }
}

async function updateCMDStore(MsgID, CmdID) {
  try {
    const filePath = path.join(databaseFolder, `data_${getBotJid() || 'default'}.json`);
    const olds = fs.existsSync(filePath) ? await readJsonFile(filePath) : [];
    olds.push({ [MsgID]: CmdID });
    await writeJsonFile(filePath, olds);
    return true;
  } catch (e) {
    console.log("Error updating command store:", e);
    return false;
  }
}

async function isbtnID(MsgID) {
  try {
    const filePath = path.join(databaseFolder, `data_${getBotJid() || 'default'}.json`);
    const olds = fs.existsSync(filePath) ? await readJsonFile(filePath) : [];
    return olds.some(item => item[MsgID]);
  } catch (e) {
    return false;
  }
}

async function getCMDStore(MsgID) {
  try {
    const filePath = path.join(databaseFolder, `data_${getBotJid() || 'default'}.json`);
    const olds = fs.existsSync(filePath) ? await readJsonFile(filePath) : [];
    const foundItem = olds.find(item => item[MsgID]);
    return foundItem ? foundItem[MsgID] : null;
  } catch (e) {
    console.log("Error retrieving command store:", e);
    return null;
  }
}

// Save a setting for THIS bot only
async function input(setting, data) {
  const botJid = getBotJid();
  if (!botJid) {
    console.warn("input() called before BOT_JID is set — skipping");
    return;
  }
  await Settings.findOneAndUpdate(
    { BOT_JID: botJid },
    { $set: { [setting]: data } },
    { upsert: true, new: true }
  );
}

// Get a setting for THIS bot only
async function get(setting) {
  const botJid = getBotJid();
  if (!botJid) return null;
  const settings = await Settings.findOne({ BOT_JID: botJid });
  return settings ? settings[setting] : null;
}

// Sync THIS bot's DB settings into the in-memory config object
async function updb() {
  const botJid = getBotJid();
  if (!botJid) {
    console.warn("updb() called before BOT_JID is set — skipping");
    return;
  }
  const settings = await Settings.findOne({ BOT_JID: botJid });
  if (settings) {
    Object.assign(config, settings.toObject());
    console.log(`Database updated for bot ${botJid} ✅`);
  }
}

// Reset THIS bot's settings to defaults
async function updfb() {
  const botJid = getBotJid();
  if (!botJid) return;
  await Settings.findOneAndDelete({ BOT_JID: botJid });
  await initSettingsForBot(botJid);
  console.log(`Database reset for bot ${botJid} ✅`);
}

async function upresbtn() {
  const filePath = path.join(databaseFolder, `data_${getBotJid() || 'default'}.json`);
  await writeJsonFile(filePath, []);
  console.log(" ├ Command store reset ✅");
}

function getCmdForCmdId(CMD_ID_MAP, cmdId) {
  const result = CMD_ID_MAP.find(entry => entry.cmdId === cmdId);
  return result ? result.cmd : null;
}

async function getalls() {
  const botJid = getBotJid();
  if (!botJid) return null;
  const settings = await Settings.findOne({ BOT_JID: botJid });
  return settings ? settings.toJSON() : null;
}

async function readJsonFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) reject(err);
      else resolve(JSON.parse(data));
    });
  });
}

async function writeJsonFile(filePath, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
      if (err) reject(err);
      else resolve(true);
    });
  });
}

module.exports = {
  updateCMDStore,
  isbtnID,
  getCMDStore,
  input,
  get,
  getalls,
  updb,
  updfb,
  upresbtn,
  getCmdForCmdId,
  connectdb,
  initSettingsForBot,   // ← export the new function
};

connectdb().catch(console.error);
