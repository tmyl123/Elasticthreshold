var nodemailer = require('nodemailer')

function sendMailAction(config, mailbody) {
  var transporter = nodemailer.createTransport({
    service: config.mailService,
    auth: {
      user: config.mailUser,
      pass: config.mailPass
    }
  });
  
  var mailOptions = {
    from: config.mailUser,
    to: config.mailTo,
    subject: 'Met the threshold',
    html: mailbody
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
//      console.log('Email sent: ' + info.response);
    }
  });
}

module.exports = {
  sendMailAction: sendMailAction
}
