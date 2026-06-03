require('dotenv').config();

const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ]
});

const PREFIX = '!';

const trivia = [
  { q: "Ibu kota Indonesia?", a: "jakarta" },
  { q: "7 x 8 = ?", a: "56" },
  { q: "Hewan terbesar di dunia?", a: "paus biru" },
  { q: "Berapa jumlah provinsi Indonesia?", a: "38" },
];

client.once('ready', () => {
  console.log(`✅ Bot ${client.user.tag} online!`);
  client.user.setActivity('!help untuk command', { type: 3 });
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // MODERASI
  if (command === 'kick') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers))
      return message.reply('❌ Kamu tidak punya izin kick!');
    const target = message.mentions.members.first();
    if (!target) return message.reply('❗ Tag member yang mau di-kick!');
    await target.kick();
    message.reply(`✅ **${target.user.tag}** telah di-kick!`);
  }

  if (command === 'ban') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers))
      return message.reply('❌ Kamu tidak punya izin ban!');
    const target = message.mentions.members.first();
    if (!target) return message.reply('❗ Tag member yang mau di-ban!');
    await target.ban();
    message.reply(`🔨 **${target.user.tag}** telah di-ban!`);
  }

  if (command === 'mute') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers))
      return message.reply('❌ Kamu tidak punya izin mute!');
    const target = message.mentions.members.first();
    const durasi = parseInt(args[0]) || 10;
    if (!target) return message.reply('❗ Tag member yang mau di-mute!');
    await target.timeout(durasi * 60 * 1000);
    message.reply(`🔇 **${target.user.tag}** di-mute selama **${durasi} menit**!`);
  }

  if (command === 'clear') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages))
      return message.reply('❌ Kamu tidak punya izin hapus pesan!');
    const jumlah = parseInt(args[0]) || 5;
    await message.channel.bulkDelete(jumlah + 1, true);
    message.channel.send(`🗑️ **${jumlah} pesan** berhasil dihapus!`).then(m => {
      setTimeout(() => m.delete(), 3000);
    });
  }

  // SERU-SERUAN
  if (command === 'meme') {
    try {
      const res = await fetch('https://meme-api.com/gimme');
      const data = await res.json();
      message.reply({ content: `😂 **${data.title}**`, files: [data.url] });
    } catch {
      message.reply('❌ Gagal ambil meme, coba lagi!');
    }
  }

  if (command === 'trivia') {
    const soal = trivia[Math.floor(Math.random() * trivia.length)];
    message.reply(`❓ **Trivia:** ${soal.q}\n⏱️ Kamu punya 15 detik!`);
    const filter = m => m.author.id === message.author.id;
    const collector = message.channel.createMessageCollector({ filter, time: 15000, max: 1 });
    collector.on('collect', m => {
      if (m.content.toLowerCase().trim() === soal.a)
        m.reply('🎉 **Benar! Selamat!**');
      else
        m.reply(`❌ Salah! Jawabannya: **${soal.a}**`);
    });
    collector.on('end', (col) => {
      if (col.size === 0)
        message.reply(`⏰ Waktu habis! Jawabannya: **${soal.a}**`);
    });
  }

  if (command === 'roll') {
    const angka = Math.floor(Math.random() * 100) + 1;
    message.reply(`🎲 Kamu dapat angka: **${angka}**`);
  }

  if (command === 'coinflip') {
    const hasil = Math.random() < 0.5 ? '🪙 Heads!' : '🪙 Tails!';
    message.reply(hasil);
  }

  if (command === 'userinfo') {
    const target = message.mentions.members.first() || message.member;
    message.reply(`
👤 **Info User**
**Nama:** ${target.user.tag}
**ID:** ${target.user.id}
**Bergabung Server:** ${target.joinedAt.toDateString()}
**Akun Dibuat:** ${target.user.createdAt.toDateString()}
    `);
  }

  // HELP
  if (command === 'help') {
    message.reply(`
**╔════════════════════╗**
**║   📋 DAFTAR COMMAND   ║**
**╚════════════════════╝**

🛡️ **MODERASI:**
\`!kick @user\` – Kick member
\`!ban @user\` – Ban member
\`!mute @user [menit]\` – Mute member
\`!clear [jumlah]\` – Hapus pesan

🎮 **SERU-SERUAN:**
\`!meme\` – Meme random
\`!trivia\` – Kuis trivia
\`!roll\` – Dadu 1-100
\`!coinflip\` – Lempar koin
\`!userinfo @user\` – Info user
    `);
  }
});

client.login(process.env.TOKEN);
