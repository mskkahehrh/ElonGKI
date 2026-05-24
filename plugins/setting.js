const config = require('../settings')
const { cmd } = require('../lib/command')
const { input, get, updb, updfb, updateSessionConfig, getSessionConfig } = require("../lib/database")

// =========================================================
// HELPER: Check if sender is allowed to change settings
// =========================================================
function isAllowed(isOwner, senderNumber, botNumber) {
    const cleanSender = (senderNumber || '').replace(/[^0-9]/g, '')
    const cleanBot = (botNumber || '').replace(/[^0-9]/g, '')
    return isOwner || cleanSender === cleanBot
}

// =========================================================
// .setting — Show current settings
// =========================================================
cmd({
    pattern: "setting",
    desc: "Show current bot settings",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, senderNumber, botNumber, reply, config: cfg }) => {
    try {
        if (!isAllowed(isOwner, senderNumber, botNumber))
            return reply("*⛔ Only the bot owner can use this command!*")

        const sessionNum = botNumber || senderNumber
        const sc = await getSessionConfig(sessionNum)

        const prefix   = sc.PREFIX         || (cfg || config).PREFIX         || '.'
        const workType = sc.WORK_TYPE       || (cfg || config).WORK_TYPE       || 'private'
        const autoView = sc.AUTO_VIEW_STATUS|| (cfg || config).AUTO_VIEW_STATUS|| 'false'
        const autoLike = sc.AUTO_LIKE_STATUS|| (cfg || config).AUTO_LIKE_STATUS|| 'false'
        const autoRec  = sc.AUTO_RECORDING  || (cfg || config).AUTO_RECORDING  || 'false'
        const autoReply= sc.AUTO_REPLY      || (cfg || config).AUTO_REPLY      || 'false'
        const autoAI   = sc.AUTO_AI         || (cfg || config).AUTO_AI         || 'false'
        const autoTyping=sc.AUTO_TYPING     || (cfg || config).AUTO_TYPING     || 'false'
        const ownerReact=sc.OWNER_REACT     || (cfg || config).OWNER_REACT     || 'true'
        const buttonMode=sc.BUTTON          || (cfg || config).BUTTON          || 'true'
        const alwaysOff =sc.ALLWAYS_OFFLINE || (cfg || config).ALLWAYS_OFFLINE || 'false'
        const lang      =(sc.LANG           || (cfg || config).LANG            || 'EN').toUpperCase()

        const presenceText = alwaysOff === 'true' ? 'offline' : 'available'

        const settingText =
`┌──────────────────────────
✦ *WORK TYPE* _${workType}_
➤ *BOT PRESENCE* _${presenceText}_
➤ *AUTO VIEW STATUS* _${autoView}_
➤ *AUTO LIKE STATUS* _${autoLike}_
➤ *AUTO RECORDING* _${autoRec}_
➤ *AUTO REPLY* _${autoReply}_
➤ *AUTO AI* _${autoAI}_
➤ *AUTO TYPING* _${autoTyping}_
➤ *OWNER REACT* _${ownerReact}_
➤ *BUTTON MODE* _${buttonMode}_
➤ *PREFIX* _${prefix}_
➤ *LANG* _${lang}_
✦ ──────────────────────────┘`

        const footer = `🍷 *Powered By ${config.OWNER_NAME || 'Bot Owner'}*`

        const sections = [
            {
                title: "⚙️ TYPE OF WORK",
                rows: [
                    { header: "Public Mode",  title: "❄️ ➤ Public Mode",  description: "Bot works for everyone",        id: `${prefix}setwork public`  },
                    { header: "Private Mode", title: "❄️ ➤ Private Mode", description: "Bot works only for you",        id: `${prefix}setwork private` },
                    { header: "Groups Only",  title: "❄️ ➤ Groups Only",  description: "Works in groups only",          id: `${prefix}setwork group`   },
                    { header: "Inbox Only",   title: "❄️ ➤ Inbox Only",   description: "Works in DM/Inbox only",        id: `${prefix}setwork inbox`   },
                ]
            },
            {
                title: "👻 GHOST & PRIVACY",
                rows: [
                    { header: "Always Online ▸ ON",  title: "❄️ ➤ Always Online ▸ ON",  description: "Show online badge always",   id: `${prefix}setalways on`       },
                    { header: "Always Online ▸ OFF", title: "❄️ ➤ Always Online ▸ OFF", description: "Hide online badge",          id: `${prefix}setalways off`      },
                    { header: "Fake Typing ▸ ON",    title: "❄️ ➤ Fake Typing ▸ ON",    description: "Show typing indicator",      id: `${prefix}setautotyping on`   },
                    { header: "Fake Typing ▸ OFF",   title: "❄️ ➤ Fake Typing ▸ OFF",   description: "Hide typing indicator",      id: `${prefix}setautotyping off`  },
                ]
            },
            {
                title: "🤖 AUTO FEATURES",
                rows: [
                    { header: "Auto View Status ▸ ON",  title: "❄️ ➤ Auto View Status ▸ ON",  description: "Automatically view statuses",  id: `${prefix}setautoview on`    },
                    { header: "Auto View Status ▸ OFF", title: "❄️ ➤ Auto View Status ▸ OFF", description: "Stop auto viewing statuses",   id: `${prefix}setautoview off`   },
                    { header: "Auto Like Status ▸ ON",  title: "❄️ ➤ Auto Like Status ▸ ON",  description: "Auto react to statuses",       id: `${prefix}setautolike on`    },
                    { header: "Auto Like Status ▸ OFF", title: "❄️ ➤ Auto Like Status ▸ OFF", description: "Stop auto reacting statuses",  id: `${prefix}setautolike off`   },
                    { header: "Auto Recording ▸ ON",    title: "❄️ ➤ Auto Recording ▸ ON",    description: "Show recording indicator",     id: `${prefix}setautorec on`     },
                    { header: "Auto Recording ▸ OFF",   title: "❄️ ➤ Auto Recording ▸ OFF",   description: "Hide recording indicator",     id: `${prefix}setautorec off`    },
                    { header: "Auto Reply ▸ ON",        title: "❄️ ➤ Auto Reply ▸ ON",        description: "Enable auto reply messages",   id: `${prefix}setautoreply on`   },
                    { header: "Auto Reply ▸ OFF",       title: "❄️ ➤ Auto Reply ▸ OFF",       description: "Disable auto reply messages",  id: `${prefix}setautoreply off`  },
                    { header: "Auto AI ▸ ON",           title: "❄️ ➤ Auto AI ▸ ON",           description: "Enable AI auto response",      id: `${prefix}setautoai on`      },
                    { header: "Auto AI ▸ OFF",          title: "❄️ ➤ Auto AI ▸ OFF",          description: "Disable AI auto response",     id: `${prefix}setautoai off`     },
                ]
            },
            {
                title: "🔧 BOT SETTINGS",
                rows: [
                    { header: "Button Mode ▸ ON",    title: "❄️ ➤ Button Mode ▸ ON",    description: "Use interactive buttons",    id: `${prefix}setbutton true`      },
                    { header: "Button Mode ▸ OFF",   title: "❄️ ➤ Button Mode ▸ OFF",   description: "Use plain text replies",     id: `${prefix}setbutton false`     },
                    { header: "Owner React ▸ ON",    title: "❄️ ➤ Owner React ▸ ON",    description: "React to owner messages",    id: `${prefix}setownerreact true`  },
                    { header: "Owner React ▸ OFF",   title: "❄️ ➤ Owner React ▸ OFF",   description: "Disable owner reactions",    id: `${prefix}setownerreact false` },
                ]
            },
        ]

        if (config.BUTTON === 'true') {
            await conn.sendMessage(from, {
                image: { url: config.IMAGE_PATH },
                caption: settingText + `\n\n${footer}`,
                footer: footer,
                sections,
                listType: 1,
                buttonText: "⚙️ SETTING NEW"
            }, { quoted: mek })
        } else {
            await conn.sendMessage(from, { text: settingText + `\n\n${footer}` }, { quoted: mek })
        }
    } catch (e) {
        console.log(e)
        reply("*Error ❌*")
    }
})

// =========================================================
// RESET DATABASE
// =========================================================
cmd({
    pattern: "resetdb",
    desc: "Reset Database to defaults",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { isOwner, senderNumber, botNumber, reply }) => {
    try {
        if (!isAllowed(isOwner, senderNumber, botNumber))
            return reply("*⛔ Only the bot owner can use this command!*")
        await updfb()
        await updb()
        return reply("*✅ Database reset & reloaded successfully!*")
    } catch (e) {
        console.log(e)
        reply("*Error ❌*")
    }
})

// =========================================================
// setwork
// =========================================================
cmd({
    pattern: "setwork",
    desc: "Set bot work type",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { q, isOwner, senderNumber, botNumber, reply }) => {
    try {
        if (!isAllowed(isOwner, senderNumber, botNumber))
            return reply("*⛔ Only the bot owner can use this command!*")
        const allowed = ['public', 'private', 'group', 'inbox']
        const val = (q || '').trim().toLowerCase()
        if (!val || !allowed.includes(val))
            return reply(`*Usage:* setwork public / private / group / inbox`)
        const sessionNum = botNumber || senderNumber
        await updateSessionConfig(sessionNum, 'WORK_TYPE', val)
        reply(`*✅ Work Type updated to:* _${val}_`)
    } catch (e) {
        console.log(e)
        reply("*Error ❌*")
    }
})

// =========================================================
// setalways
// =========================================================
cmd({
    pattern: "setalways",
    desc: "Always online mode",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { q, isOwner, senderNumber, botNumber, reply }) => {
    try {
        if (!isAllowed(isOwner, senderNumber, botNumber))
            return reply("*⛔ Only the bot owner can use this command!*")
        const val = (q || '').trim().toLowerCase()
        if (val !== 'on' && val !== 'off')
            return reply(`*Usage:* setalways on / off`)
        const sessionNum = botNumber || senderNumber
        await updateSessionConfig(sessionNum, 'ALLWAYS_OFFLINE', val === 'on' ? 'false' : 'true')
        reply(`*✅ Always Online:* _${val.toUpperCase()}_`)
    } catch (e) {
        console.log(e)
        reply("*Error ❌*")
    }
})

// =========================================================
// setautotyping
// =========================================================
cmd({
    pattern: "setautotyping",
    desc: "Auto typing indicator",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { q, isOwner, senderNumber, botNumber, reply }) => {
    try {
        if (!isAllowed(isOwner, senderNumber, botNumber))
            return reply("*⛔ Only the bot owner can use this command!*")
        const val = (q || '').trim().toLowerCase()
        if (val !== 'on' && val !== 'off')
            return reply(`*Usage:* setautotyping on / off`)
        const sessionNum = botNumber || senderNumber
        await updateSessionConfig(sessionNum, 'AUTO_TYPING', val === 'on' ? 'true' : 'false')
        reply(`*✅ Auto Typing:* _${val.toUpperCase()}_`)
    } catch (e) {
        console.log(e)
        reply("*Error ❌*")
    }
})

// =========================================================
// setautoview
// =========================================================
cmd({
    pattern: "setautoview",
    desc: "Auto view status",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { q, isOwner, senderNumber, botNumber, reply }) => {
    try {
        if (!isAllowed(isOwner, senderNumber, botNumber))
            return reply("*⛔ Only the bot owner can use this command!*")
        const val = (q || '').trim().toLowerCase()
        if (val !== 'on' && val !== 'off')
            return reply(`*Usage:* setautoview on / off`)
        const sessionNum = botNumber || senderNumber
        await updateSessionConfig(sessionNum, 'AUTO_VIEW_STATUS', val === 'on' ? 'true' : 'false')
        reply(`*✅ Auto View Status:* _${val.toUpperCase()}_`)
    } catch (e) {
        console.log(e)
        reply("*Error ❌*")
    }
})

// =========================================================
// setautolike
// =========================================================
cmd({
    pattern: "setautolike",
    desc: "Auto like status",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { q, isOwner, senderNumber, botNumber, reply }) => {
    try {
        if (!isAllowed(isOwner, senderNumber, botNumber))
            return reply("*⛔ Only the bot owner can use this command!*")
        const val = (q || '').trim().toLowerCase()
        if (val !== 'on' && val !== 'off')
            return reply(`*Usage:* setautolike on / off`)
        const sessionNum = botNumber || senderNumber
        await updateSessionConfig(sessionNum, 'AUTO_LIKE_STATUS', val === 'on' ? 'true' : 'false')
        reply(`*✅ Auto Like Status:* _${val.toUpperCase()}_`)
    } catch (e) {
        console.log(e)
        reply("*Error ❌*")
    }
})

// =========================================================
// setautorec
// =========================================================
cmd({
    pattern: "setautorec",
    desc: "Auto recording indicator",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { q, isOwner, senderNumber, botNumber, reply }) => {
    try {
        if (!isAllowed(isOwner, senderNumber, botNumber))
            return reply("*⛔ Only the bot owner can use this command!*")
        const val = (q || '').trim().toLowerCase()
        if (val !== 'on' && val !== 'off')
            return reply(`*Usage:* setautorec on / off`)
        const sessionNum = botNumber || senderNumber
        await updateSessionConfig(sessionNum, 'AUTO_RECORDING', val === 'on' ? 'true' : 'false')
        reply(`*✅ Auto Recording:* _${val.toUpperCase()}_`)
    } catch (e) {
        console.log(e)
        reply("*Error ❌*")
    }
})

// =========================================================
// setautoreply
// =========================================================
cmd({
    pattern: "setautoreply",
    desc: "Auto reply feature",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { q, isOwner, senderNumber, botNumber, reply }) => {
    try {
        if (!isAllowed(isOwner, senderNumber, botNumber))
            return reply("*⛔ Only the bot owner can use this command!*")
        const val = (q || '').trim().toLowerCase()
        if (val !== 'on' && val !== 'off')
            return reply(`*Usage:* setautoreply on / off`)
        const sessionNum = botNumber || senderNumber
        await updateSessionConfig(sessionNum, 'AUTO_REPLY', val === 'on' ? 'true' : 'false')
        reply(`*✅ Auto Reply:* _${val.toUpperCase()}_`)
    } catch (e) {
        console.log(e)
        reply("*Error ❌*")
    }
})

// =========================================================
// setautoai
// =========================================================
cmd({
    pattern: "setautoai",
    desc: "Auto AI response",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { q, isOwner, senderNumber, botNumber, reply }) => {
    try {
        if (!isAllowed(isOwner, senderNumber, botNumber))
            return reply("*⛔ Only the bot owner can use this command!*")
        const val = (q || '').trim().toLowerCase()
        if (val !== 'on' && val !== 'off')
            return reply(`*Usage:* setautoai on / off`)
        const sessionNum = botNumber || senderNumber
        await updateSessionConfig(sessionNum, 'AUTO_AI', val === 'on' ? 'true' : 'false')
        reply(`*✅ Auto AI:* _${val.toUpperCase()}_`)
    } catch (e) {
        console.log(e)
        reply("*Error ❌*")
    }
})

// =========================================================
// setbutton
// =========================================================
cmd({
    pattern: "setbutton",
    desc: "Button mode on/off",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { q, isOwner, senderNumber, botNumber, reply }) => {
    try {
        if (!isAllowed(isOwner, senderNumber, botNumber))
            return reply("*⛔ Only the bot owner can use this command!*")
        const val = (q || '').trim().toLowerCase()
        if (val !== 'true' && val !== 'false')
            return reply(`*Usage:* setbutton true / false`)
        const sessionNum = botNumber || senderNumber
        await updateSessionConfig(sessionNum, 'BUTTON', val)
        reply(`*✅ Button Mode:* _${val}_`)
    } catch (e) {
        console.log(e)
        reply("*Error ❌*")
    }
})

// =========================================================
// setownerreact
// =========================================================
cmd({
    pattern: "setownerreact",
    desc: "Owner react feature",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { q, isOwner, senderNumber, botNumber, reply }) => {
    try {
        if (!isAllowed(isOwner, senderNumber, botNumber))
            return reply("*⛔ Only the bot owner can use this command!*")
        const val = (q || '').trim().toLowerCase()
        if (val !== 'true' && val !== 'false')
            return reply(`*Usage:* setownerreact true / false`)
        const sessionNum = botNumber || senderNumber
        await updateSessionConfig(sessionNum, 'OWNER_REACT', val)
        reply(`*✅ Owner React:* _${val}_`)
    } catch (e) {
        console.log(e)
        reply("*Error ❌*")
    }
})

// =========================================================
// Backward-compat aliases
// =========================================================
cmd({
    pattern: "button",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { q, isOwner, senderNumber, botNumber, reply }) => {
    try {
        if (!isAllowed(isOwner, senderNumber, botNumber))
            return reply("*⛔ Only the bot owner can use this command!*")
        const val = (q || '').trim().toLowerCase()
        if (val !== 'true' && val !== 'false')
            return reply("*true / false ?*")
        const sessionNum = botNumber || senderNumber
        await updateSessionConfig(sessionNum, 'BUTTON', val)
        reply(`*✅ Bot Reply Type Updated to:* ${val}`)
    } catch (e) {
        console.log(e)
        reply("*Error ❌*")
    }
})

cmd({
    pattern: "mode",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { q, isOwner, senderNumber, botNumber, reply }) => {
    try {
        if (!isAllowed(isOwner, senderNumber, botNumber))
            return reply("*⛔ Only the bot owner can use this command!*")
        if (!q) return reply("*public / private / group ?*")
        const sessionNum = botNumber || senderNumber
        await updateSessionConfig(sessionNum, 'WORK_TYPE', q.trim().toLowerCase())
        reply(`*✅ Work mode updated to:* ${q}`)
    } catch (e) {
        console.log(e)
    }
})

cmd({
    pattern: "setprefix",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { q, isOwner, senderNumber, botNumber, reply }) => {
    try {
        if (!isAllowed(isOwner, senderNumber, botNumber))
            return reply("*⛔ Only the bot owner can use this command!*")
        const sessionNum = botNumber || senderNumber
        await updateSessionConfig(sessionNum, 'PREFIX', q)
        reply(`*✅ New Prefix:* ${q}`)
    } catch (e) {
        console.log(e)
    }
})
