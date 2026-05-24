const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const config = require('../settings')

const databaseFolder = path.join(__dirname, 'database');

if (!fs.existsSync(databaseFolder)) {
  fs.mkdirSync(databaseFolder);
}

const settingsSchema = new mongoose.Schema({
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

    const settingsCount = await Settings.countDocuments();
    if (settingsCount === 0) {
      await initializeSettings();
    }
  } catch (error) {
    console.error(" ├ Database connection error:", error);
  }
}

async function initializeSettings() {
  const settings = new Settings(); 
  await settings.save(); 
  console.log("Settings initialized ✅");
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
    return olds.some(item => item[MsgID]); //
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

async function input(setting, data) {
  const settings = await Settings.findOne(); 
  if (settings && setting in settings) {
    settings[setting] = data;
    await settings.save(); 
  }
}

async function get(setting) {
  const settings = await Settings.findOne();
  return settings ? settings[setting] : null; 
}

async function updb() {
  const settings = await Settings.findOne(); 
  Object.assign(config, settings.toObject());
  console.log("Database updated ✅");
}

async function updfb() {
  await resetSettings(); 
  console.log("Database reset and initialized ✅");
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
  await initializeSettings(); 
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

async function getalls() {
  const settings = await Settings.findOne();
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

// =========================================================
// PER-SESSION CONFIG (multi-bot isolation)
// Each bot number has its own document in 'configs' collection
// =========================================================
let _mongoClient2, _mongoDB2, _configsCol2;
const _configCache = new Map();
const CONFIG_CACHE_TTL = 60000; // 60s

async function _initConfigMongo() {
  if (_configsCol2) return;
  const { MongoClient } = require('mongodb');
  _mongoClient2 = new MongoClient(config.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  await _mongoClient2.connect();
  _mongoDB2 = _mongoClient2.db(config.MONGO_DB);
  _configsCol2 = _mongoDB2.collection('configs');
  await _configsCol2.createIndex({ number: 1 }, { unique: true });
}

async function setSessionConfig(number, conf) {
  try {
    await _initConfigMongo();
    const sanitized = (number || '').replace(/[^0-9]/g, '');
    await _configsCol2.updateOne(
      { number: sanitized },
      { $set: { number: sanitized, config: conf, updatedAt: new Date() } },
      { upsert: true }
    );
    _configCache.set(sanitized, { config: conf, ts: Date.now() });
  } catch (e) { console.error('setSessionConfig error:', e); }
}

async function getSessionConfig(number) {
  try {
    await _initConfigMongo();
    const sanitized = (number || '').replace(/[^0-9]/g, '');
    const cached = _configCache.get(sanitized);
    if (cached && (Date.now() - cached.ts) < CONFIG_CACHE_TTL) return cached.config || {};
    const doc = await _configsCol2.findOne({ number: sanitized });
    const conf = (doc && doc.config) ? doc.config : {};
    _configCache.set(sanitized, { config: conf, ts: Date.now() });
    return conf;
  } catch (e) { console.error('getSessionConfig error:', e); return {}; }
}

async function updateSessionConfig(number, key, value) {
  const conf = await getSessionConfig(number);
  conf[key] = value;
  await setSessionConfig(number, conf);
}

module.exports.setSessionConfig = setSessionConfig;
module.exports.getSessionConfig = getSessionConfig;
module.exports.updateSessionConfig = updateSessionConfig;
