const config = require('../settings')
const { cmd } = require('../lib/command')
const { input, get, updb, updfb, loadUserConfig, saveUserConfig, updateUserConfigKey } = require("../lib/database")

// =========================================================
// HELPER: Check if sender is allowed to change settings
// Only OWNER_NUMBER or the bot's own connected number
// =========================================================
function isAllowed(isOwner, senderNumber, botNumber) {
    const cleanSender = (senderNumber || '').replace(/[^0-9]/g, '')
    const cleanBot = (botNumber || '').replace(/[^0-9]/g, '')
    return isOwner || cleanSender === cleanBot
}

// =========================================================
// .setting — Show current settings + SETTING NEW button
// Only applies to the linked/connected device of the user
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

        // Load per-user config for this linked device
        const userCfg = await loadUserConfig(botNumber)
        const base    = cfg || config

        const prefix   = userCfg.PREFIX     || base.PREFIX     || '.'
        const workType = (userCfg.WORK_TYPE || base.WORK_TYPE  || 'private').toLowerCase()
        const autoView = (userCfg.AUTO_VIEW_STATUS || base.AUTO_VIEW_STATUS || 'false').toLowerCase()
        const autoLike = (userCfg.AUTO_LIKE_STATUS || base.AUTO_LIKE_STATUS || 'false').toLowerCase()
        const autoRec  = (userCfg.AUTO_RECORDING   || base.AUTO_RECORDING   || 'false').toLowerCase()
        const autoReply= (userCfg.AUTO_REPLY        || base.AUTO_REPLY       || 'false').toLowerCase()
        const autoAI   = (userCfg.AUTO_AI           || base.AUTO_AI          || 'false').toLowerCase()
        const autoTyping=(userCfg.AUTO_TYPING       || base.AUTO_TYPING      || 'false').toLowerCase()
        const ownerReact=(userCfg.OWNER_REACT       || base.OWNER_REACT      || 'true').toLowerCase()
        const buttonMode=(userCfg.BUTTON            || base.BUTTON           || 'true').toLowerCase()
        const alwaysOff =(userCfg.ALLWAYS_OFFLINE   || base.ALLWAYS_OFFLINE  || 'false').toLowerCase()
        const lang      =(userCfg.LANG              || base.LANG             || 'EN').toUpperCase()

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
                    { header: "Button Mode ▸ OFF",   title: "❄️ ➤ Button Mode ▸ OFF",   description: "Use numbered text mode",     id: `${prefix}setbutton false`     },
                    { header: "Owner React ▸ ON",    title: "❄️ ➤ Owner React ▸ ON",    description: "React to owner messages",    id: `${prefix}setownerreact true`  },
                    { header: "Owner React ▸ OFF",   title: "❄️ ➤ Owner React ▸ OFF",   description: "Stop reacting to owner",     id: `${prefix}setownerreact false` },
                ]
            },
            {
                title: "🗄️ DATABASE",
                rows: [
                    { header: "Reset Database", title: "❄️ ➤ Reset Database", description: "Reset all settings to default", id: `${prefix}resetdb` },
                ]
            }
        ]

        const buttons = [
            {
                buttonId: "setting_panel",
                buttonText: { displayText: "SETTING NEW ❄️" },
                name: "single_select",
                paramsJson: JSON.stringify({
                    title: "⚙️ Select a Setting to Change",
                    sections: sections
                })
            }
        ]

        if ((userCfg.BUTTON || config.BUTTON) === 'true') {
            const buttonMessage = {
                image: { url: config.IMAGE_PATH },
                caption: settingText,
                footer: footer,
                buttons: buttons,
                headerType: 4
            }
            await conn.sendMessage(from, buttonMessage, { quoted: mek })
        } else {
            await reply(
`${settingText}

*📋 \`Setting Commands\`:*
➤ \`${prefix}setwork\` public/private/group/inbox
➤ \`${prefix}setalways\` on/off
➤ \`${prefix}setautotyping\` on/off
➤ \`${prefix}setautoview\` on/off
➤ \`${prefix}setautolike\` on/off
➤ \`${prefix}setautorec\` on/off
➤ \`${prefix}setautoreply\` on/off
➤ \`${prefix}setautoai\` on/off
➤ \`${prefix}setbutton\` true/false
➤ \`${prefix}setownerreact\` true/false
➤ \`${prefix}resetdb\` — Reset all settings

${footer}`
            )
        }
    } catch (e) {
        console.log(e)
        reply("*Error ❌*")
    }
})

// =========================================================
// RESET DATABASE — resets only THIS linked device's config
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
        // Clear per-user config for this linked device
        await saveUserConfig(botNumber, {})
        // Also reset global mongoose settings
        await updfb()
        await updb()
        return reply("*✅ Database reset & reloaded successfully!*")
    } catch (e) {
        console.log(e)
        reply("*Error ❌*")
    }
})

// =========================================================
// setwork — Change WORK_TYPE (per linked device)
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
        await updateUserConfigKey(botNumber, 'WORK_TYPE', val)
        reply(`*✅ Work Type updated to:* _${val}_`)
    } catch (e) {
        console.log(e)
        reply("*Error ❌*")
    }
})

// =========================================================
// setalways — Always Online ON/OFF (per linked device)
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
        const dbVal = val === 'on' ? 'false' : 'true'
        await updateUserConfigKey(botNumber, 'ALLWAYS_OFFLINE', dbVal)
        reply(`*✅ Always Online:* _${val.toUpperCase()}_`)
    } catch (e) {
        console.log(e)
        reply("*Error ❌*")
    }
})

// =========================================================
// setautotyping — Fake Typing ON/OFF (per linked device)
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
        const dbVal = val === 'on' ? 'true' : 'false'
        await updateUserConfigKey(botNumber, 'AUTO_TYPING', dbVal)
        reply(`*✅ Auto Typing:* _${val.toUpperCase()}_`)
    } catch (e) {
        console.log(e)
        reply("*Error ❌*")
    }
})

// =========================================================
// setautoview — Auto View Status ON/OFF (per linked device)
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
        const dbVal = val === 'on' ? 'true' : 'false'
        await updateUserConfigKey(botNumber, 'AUTO_VIEW_STATUS', dbVal)
        reply(`*✅ Auto View Status:* _${val.toUpperCase()}_`)
    } catch (e) {
        console.log(e)
        reply("*Error ❌*")
    }
})

// =========================================================
// setautolike — Auto Like Status ON/OFF (per linked device)
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
        const dbVal = val === 'on' ? 'true' : 'false'
        await updateUserConfigKey(botNumber, 'AUTO_LIKE_STATUS', dbVal)
        reply(`*✅ Auto Like Status:* _${val.toUpperCase()}_`)
    } catch (e) {
        console.log(e)
        reply("*Error ❌*")
    }
})

// =========================================================
// setautorec — Auto Recording ON/OFF (per linked device)
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
        const dbVal = val === 'on' ? 'true' : 'false'
        await updateUserConfigKey(botNumber, 'AUTO_RECORDING', dbVal)
        reply(`*✅ Auto Recording:* _${val.toUpperCase()}_`)
    } catch (e) {
        console.log(e)
        reply("*Error ❌*")
    }
})

// =========================================================
// setautoreply — Auto Reply ON/OFF (per linked device)
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
        const dbVal = val === 'on' ? 'true' : 'false'
        await updateUserConfigKey(botNumber, 'AUTO_REPLY', dbVal)
        reply(`*✅ Auto Reply:* _${val.toUpperCase()}_`)
    } catch (e) {
        console.log(e)
        reply("*Error ❌*")
    }
})

// =========================================================
// setautoai — Auto AI ON/OFF (per linked device)
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
        const dbVal = val === 'on' ? 'true' : 'false'
        await updateUserConfigKey(botNumber, 'AUTO_AI', dbVal)
        reply(`*✅ Auto AI:* _${val.toUpperCase()}_`)
    } catch (e) {
        console.log(e)
        reply("*Error ❌*")
    }
})

// =========================================================
// setbutton — Button Mode true/false (per linked device)
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
        await updateUserConfigKey(botNumber, 'BUTTON', val)
        reply(`*✅ Button Mode:* _${val}_`)
    } catch (e) {
        console.log(e)
        reply("*Error ❌*")
    }
})

// =========================================================
// setownerreact — Owner React true/false (per linked device)
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
        await updateUserConfigKey(botNumber, 'OWNER_REACT', val)
        reply(`*✅ Owner React:* _${val}_`)
    } catch (e) {
        console.log(e)
        reply("*Error ❌*")
    }
})

// =========================================================
// Old aliases kept for backward compatibility
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
        await updateUserConfigKey(botNumber, 'BUTTON', val)
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
        await updateUserConfigKey(botNumber, 'WORK_TYPE', q.trim().toLowerCase())
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
        await updateUserConfigKey(botNumber, 'PREFIX', q)
        reply(`*✅ New Prefix:* ${q}`)
    } catch (e) {
        console.log(e)
    }
})
