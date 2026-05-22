const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const config = require('../settings')

const databaseFolder = path.join(__dirname, 'database');

if (!fs.existsSync(databaseFolder)) {
  fs.mkdirSync(databaseFolder);
}

const settingsSchema = new mongoose.Schema({
  botNumber: { type: String, default: "default", index: true },
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

settingsSchema.index({ botNumber: 1 }, { unique: true });

const Settings = mongoose.model(config.MONGO_DB, settingsSchema);

// Per-user in-memory config cache: Map<botNumber, configObject>
const userConfigs = new Map();

async function connectdb() {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log("Database connected 🛢️");
  } catch (error) {
    console.error(" ├ Database connection error:", error);
  }
}

// Ensure a settings document exists for this botNumber
async function ensureUserSettings(botNumber) {
  const key = (botNumber || 'default').replace(/[^0-9a-zA-Z]/g, '') || 'default';
  let settings = await Settings.findOne({ botNumber: key });
  if (!settings) {
    settings = new Settings({ botNumber: key });
    await settings.save();
    console.log(`Settings initialized for ${key} ✅`);
  }
  return settings;
}

// Legacy: called without botNumber — keeps existing single-doc behaviour for startup
async function initializeSettings(botNumber) {
  const key = (botNumber || 'default').replace(/[^0-9a-zA-Z]/g, '') || 'default';
  const existing = await Settings.findOne({ botNumber: key });
  if (!existing) {
    const settings = new Settings({ botNumber: key });
    await settings.save();
    console.log(`Settings initialized for ${key} ✅`);
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

// Update a setting for a specific botNumber only
async function input(setting, data, botNumber) {
  const key = (botNumber || 'default').replace(/[^0-9a-zA-Z]/g, '') || 'default';
  const settings = await ensureUserSettings(key);
  if (setting in settings) {
    settings[setting] = data;
    await settings.save();
  }
}

// Get a single setting value for a specific botNumber
async function get(setting, botNumber) {
  const key = (botNumber || 'default').replace(/[^0-9a-zA-Z]/g, '') || 'default';
  const settings = await Settings.findOne({ botNumber: key });
  return settings ? settings[setting] : null;
}

// Get all settings for a botNumber, merged with global defaults
function getConfig(botNumber) {
  const key = (botNumber || 'default').replace(/[^0-9a-zA-Z]/g, '') || 'default';
  return userConfigs.get(key) || config;
}

// Load DB settings for a botNumber into the in-memory cache
async function updb(botNumber) {
  const key = (botNumber || 'default').replace(/[^0-9a-zA-Z]/g, '') || 'default';
  const settings = await ensureUserSettings(key);
  const dbData = settings.toObject();
  // Build a merged config: global defaults + DB overrides for this user only
  const merged = Object.assign({}, config, dbData);
  userConfigs.set(key, merged);
  console.log(`Config updated for ${key} ✅`);
  return merged;
}

// Reset settings to defaults for a specific botNumber
async function updfb(botNumber) {
  const key = (botNumber || 'default').replace(/[^0-9a-zA-Z]/g, '') || 'default';
  await Settings.deleteOne({ botNumber: key });
  await initializeSettings(key);
  userConfigs.delete(key);
  console.log(`Config reset for ${key} ✅`);
}

async function upresbtn() {
  await writeJsonFile(path.join(databaseFolder, 'data.json'), []);
  console.log(" ├ Command store reset ✅");
}

function getCmdForCmdId(CMD_ID_MAP, cmdId) {
  const result = CMD_ID_MAP.find(entry => entry.cmdId === cmdId);
  return result ? result.cmd : null;
}

async function resetSettings(botNumber) {
  const key = (botNumber || 'default').replace(/[^0-9a-zA-Z]/g, '') || 'default';
  await Settings.deleteOne({ botNumber: key });
  await initializeSettings(key);
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

async function getalls(botNumber) {
  const key = (botNumber || 'default').replace(/[^0-9a-zA-Z]/g, '') || 'default';
  const settings = await Settings.findOne({ botNumber: key });
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
  getConfig,
  ensureUserSettings,
};

connectdb().catch(console.error);
