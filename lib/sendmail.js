var nodemailer = require('nodemailer');

function sendMailAction(auth, mailbody) {
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: auth.user,
      pass: auth.pass
    }
  });
  
  var mailOptions = {
    from: 'youremail@gmail.com',
    to: 'tommy.lin@pajops.com',
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
