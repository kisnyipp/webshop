var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({ //email elérési adatok
    host: 'smtp.gmail.com',
    secure: true,
    // ezeket fájlból kellene olvasni
    auth: {
      user: 'webshopmail@gmail.com',
      pass: 'tesztpassword'
    }
  });

function sendMail(name, address, text, copy, res){
    var mailOptions = { //saját címre
    from: 'webshopmail@gmail.com',
    to: 'webshopmail@gmail.com',
    subject: 'Honlapról továbbított email!',
    text: `Név: ${name} \n E-mail cím: ${address} \n \n ${text}`
  };
  var mailCopyOptions = { //ha kér copyt
    from: 'webshopmail@gmail.com',
    to: address,
    subject: 'webshop honlapjáról továbbított üzenet',
    text: `Bevezető szöveg... Az üzenet: \n\n
    Név: ${name} \n E-mail cím: ${address} \n \n ${text} \n \n
    Aláírás`
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
      res.statusCode = 404;
      res.end("Az e-mailt nem sikerült elküldeni!");
    } 
    else { 
      if (copy == true){ //ha kell copy
        transporter.sendMail(mailCopyOptions, function(error, info){ 
          if(error){ //ha a mail sikerült de a copy nem
            console.log(error);
            res.statusCode=404;
            res.end("A másolatot nem sikerült elküldeni!");
          }
          else{ //ha mindkettő sikerült
            console.log('Copy sent: ' + info.response);
            res.statusCode = 200;
            res.end("E-mailek sikeresen elküldve!");
          }
        });
      } 
      else{ //ha nem kell copy
        console.log('Email sent: ' + info.response);
        res.statusCode = 200;
        res.end("E-mail sikeresen elküldve!");
      }
    }
  });
}

module.exports = {
    sendMail: sendMail
}