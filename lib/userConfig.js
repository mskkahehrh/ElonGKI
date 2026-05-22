const { MongoClient } = require('mongodb');
const config = require('../settings');

const MONGO_URI = config.MONGO_URI;
const MONGO_DB = config.MONGO_DB;

let _client = null;
let _db = null;
let _col = null;

async function _init() {
    if (_col) return;
    _client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    await _client.connect();
    _db = _client.db(MONGO_DB);
    _col = _db.collection('configs');
    await _col.createIndex({ number: 1 }, { unique: true });
}

async function setUserConfigInMongo(number, conf) {
    try {
        await _init();
        const sanitized = (number || '').replace(/[^0-9]/g, '');
        await _col.updateOne(
            { number: sanitized },
            { $set: { number: sanitized, config: conf, updatedAt: new Date() } },
            { upsert: true }
        );
    } catch (e) {
        console.error('setUserConfigInMongo error:', e);
    }
}

async function loadUserConfigFromMongo(number) {
    try {
        await _init();
        const sanitized = (number || '').replace(/[^0-9]/g, '');
        const doc = await _col.findOne({ number: sanitized });
        return doc ? doc.config : null;
    } catch (e) {
        console.error('loadUserConfigFromMongo error:', e);
        return null;
    }
}

module.exports = { setUserConfigInMongo, loadUserConfigFromMongo };
