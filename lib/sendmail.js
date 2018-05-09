var nodemailer = require('nodemailer'),
		pug        = require('pug')

function sendMailAction(config, data) {
  var transporter = nodemailer.createTransport({
    service: config.mailService,
    auth: {
      user: config.mailUser,
      pass: config.mailPass
    }
  });

	var compiledFunction = pug.compileFile(config.mailbody);

	var html = compiledFunction({
					config: config, 
					data: data
	})
  
  var mailOptions = {
    from: config.mailUser,
    to: config.mailTo,
    subject: config.mailSubject,
    html: html
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
