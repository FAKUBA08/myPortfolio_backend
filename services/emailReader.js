const Imap = require('imap');
const { simpleParser } = require('mailparser');

function startEmailReader(io) {
  const imap = new Imap({
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASS,
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
  });

  function openInbox(cb) {
    imap.openBox('INBOX', false, cb);
  }

  imap.once('ready', function () {
    openInbox(function (err, box) {
      if (err) throw err;

      console.log('📥 Email inbox opened');

      imap.on('mail', function () {
        const fetch = imap.seq.fetch(box.messages.total + ':*', {
          bodies: '',
          struct: true
        });

        fetch.on('message', function (msg) {
          msg.on('body', function (stream) {
            simpleParser(stream, async (err, parsed) => {
              if (err) return console.error('❌ Email parse error:', err);

              // ✅ Real fix: use exact email address, not 'includes'
              const fromAddress = parsed.from?.value?.[0]?.address || '';
              const subject = parsed.subject || '';
              const body = parsed.text?.trim();

              // ✅ Ignore emails sent by yourself
              if (fromAddress === process.env.EMAIL_USER) {
                console.log("⚠️ Ignored self-sent email.");
                return;
              }

              console.log(`📨 New email from: ${fromAddress}`);
              console.log(`📄 Subject: ${subject}`);
              console.log(`📝 Body: ${body}`);

              const match = subject.match(/UserMsg:(.+)/);
              if (!match) {
                console.warn('⚠️ Could not find userId in subject');
                return;
              }

              const userId = match[1].trim();
              const socket = Array.from(io.sockets.sockets.values()).find(
                (s) => s.handshake.query.userId === userId
              );

              if (socket) {
                socket.emit('message', {
                  text: body,
                  sender: 'admin',
                  timestamp: new Date()
                });
                console.log(`✅ Reply sent to user ${userId}`);
              } else {
                console.warn(`⚠️ No socket found for userId: ${userId}`);
              }
            });
          });
        });
      });
    });
  });

  imap.once('error', function (err) {
    console.log('❌ IMAP error:', err);
  });

  imap.once('end', function () {
    console.log('📤 Connection to inbox ended');
  });

  imap.connect();
}

module.exports = {
  startEmailReader,
};
