const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const config = require('../settings')

const databaseFolder = path.join(__dirname, 'database');

if (!fs.existsSync(databaseFolder)) {
  fs.mkdirSync(databaseFolder);
}

const settingsSchema = new mongoose.Schema({
  // 'number' is the per-user key. 'global' is used for the legacy/default document.
  number: { type: String, default: 'global', index: true, unique: true },
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

const Settings = mongoose.model(config.MONGO_DB, settingsSchema);

async function connectdb() {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log("Database connected 🛢️");

    // Ensure the legacy 'global' document exists for backward compatibility
    const globalDoc = await Settings.findOne({ number: 'global' });
    if (!globalDoc) {
      await new Settings({ number: 'global' }).save();
      console.log("Global settings document initialized ✅");
    }
  } catch (error) {
    console.error(" ├ Database connection error:", error);
  }
}

async function initializeSettingsForUser(number) {
  const existing = await Settings.findOne({ number });
  if (!existing) {
    await new Settings({ number }).save();
    console.log(`Settings initialized for ${number} ✅`);
  }
}

async function updateCMDStore(MsgID, CmdID) {
  try {
    const filePath = path.join(databaseFolder, 'data.json');
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
    const filePath = path.join(databaseFolder, 'data.json');
    const olds = fs.existsSync(filePath) ? await readJsonFile(filePath) : [];
    return olds.some(item => item[MsgID]);
  } catch (e) {
    return false;
  }
}

async function getCMDStore(MsgID) {
  try {
    const filePath = path.join(databaseFolder, 'data.json');
    const olds = fs.existsSync(filePath) ? await readJsonFile(filePath) : [];
    const foundItem = olds.find(item => item[MsgID]);
    return foundItem ? foundItem[MsgID] : null; 
  } catch (e) {
    console.log("Error retrieving command store:", e);
    return null;
  }
}

/**
 * Save a setting for a specific user/session.
 * @param {string} setting - The setting key to update.
 * @param {*} data - The new value.
 * @param {string} [number='global'] - The session's phone number. Defaults to 'global' for backward compat.
 */
async function input(setting, data, number = 'global') {
  // Upsert: create the per-user document if it doesn't exist yet
  let settings = await Settings.findOne({ number });
  if (!settings) {
    settings = new Settings({ number });
  }
  if (setting in settings) {
    settings[setting] = data;
    await settings.save();
  }
}

/**
 * Read a single setting for a specific user/session.
 * @param {string} setting - The setting key.
 * @param {string} [number='global'] - The session's phone number.
 */
async function get(setting, number = 'global') {
  const settings = await Settings.findOne({ number });
  return settings ? settings[setting] : null; 
}

/**
 * Load settings for a specific user/session and return them as a plain object.
 * Falls back to 'global' document values if no per-user document exists.
 * Does NOT mutate the shared global config object.
 *
 * @param {string} [number='global'] - The session's phone number.
 * @returns {Object} Plain settings object merged with defaults.
 */
async function updb(number = 'global') {
  // Load global/default settings first
  let globalSettings = await Settings.findOne({ number: 'global' });
  const base = globalSettings ? globalSettings.toObject() : {};

  let userSettings = base;
  if (number !== 'global') {
    const perUserDoc = await Settings.findOne({ number });
    if (perUserDoc) {
      // Per-user settings override the global defaults
      userSettings = { ...base, ...perUserDoc.toObject() };
    }
  }

  // Remove internal Mongoose fields
  delete userSettings._id;
  delete userSettings.__v;

  console.log(`Settings loaded for ${number} ✅`);
  return userSettings;
}

/**
 * Reset settings for a specific user/session back to schema defaults.
 * @param {string} [number='global']
 */
async function updfb(number = 'global') {
  await Settings.deleteOne({ number });
  await initializeSettingsForUser(number);
  console.log(`Settings reset for ${number} ✅`);
}

async function upresbtn() {
  await writeJsonFile(path.join(databaseFolder, 'data.json'), []);
  console.log(" ├ Command store reset ✅");
}

function getCmdForCmdId(CMD_ID_MAP, cmdId) {
  const result = CMD_ID_MAP.find(entry => entry.cmdId === cmdId);
  return result ? result.cmd : null;
}

async function resetSettings() {
  await Settings.deleteMany(); 
  await new Settings({ number: 'global' }).save();
}

async function readJsonFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(data));
      }
    });
  });
}

async function getalls(number = 'global') {
  const settings = await Settings.findOne({ number });
  return settings ? settings.toJSON() : null;
}

async function writeJsonFile(filePath, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
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
};

connectdb().catch(console.error);
