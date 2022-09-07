const { Client, GatewayIntentBits } = require('discord.js')

const config = require('./config.json')

const client = {}

config.forEach((reaction, index) => {
  client[index] = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions]
  })

  const onReady = async () => {
    const channel = client[index].channels.cache.get(reaction.channel_id)
    console.log(
      `Logged in as ${client[index].user.tag} & watching ${channel.name} message id (${reaction.message_id}) !`
    )
    try {
      await channel.messages.fetch(reaction.message_id)
    } catch (error) {
      console.log(error)
    }
  }

  const addRole = async ({ message, _emoji }, user) => {
    console.log(`${user.tag} reacted with ${_emoji.name} (${_emoji.id})`)
    if (user.bot || message.id !== reaction.message_id) return
    if (message.partial) {
      try {
        await message.fetch()
      } catch (error) {
        console.log(error)
      }
    }

    const { guild } = message
    const member = guild.members.cache.get(user.id)
    const roleId = reaction.reaction.find(role => role.emoji_id === _emoji.id)?.role_id

    if (!roleId) return

    try {
      await member.roles.add(roleId)
    } catch (error) {
      console.log(error)
    }
  }

  const removeRole = async ({ message, _emoji }, user) => {
    console.log(`${user.tag} removed reaction ${_emoji.name} (${_emoji.id})`)
    if (user.bot || message.id !== reaction.message_id) return
    if (message.partial) {
      try {
        await message.fetch()
      } catch (error) {
        console.log(error)
      }
    }

    const { guild } = message
    const member = guild.members.cache.get(user.id)
    const roleId = reaction.reaction.find(role => role.emoji_id === _emoji.id)?.role_id

    if (!roleId) return

    try {
      await member.roles.remove(roleId)
    } catch (error) {
      console.log(error)
    }
  }

  client[index].on('ready', onReady)
  client[index].on('messageReactionAdd', addRole)
  client[index].on('messageReactionRemove', removeRole)
  client[index].login(process.env.BOT_TOKEN)
})
