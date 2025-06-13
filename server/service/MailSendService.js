const nodemailer = require('nodemailer');

class MailSendService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PW, // 앱 비밀번호 사용
            },
        });
    }
    /*
    
    const mailOptions = {
        from: 'your_email@gmail.com',
        to: 'receiver@example.com',
        subject: '테스트 메일',
        text: 'Node.js에서 보낸 메일입니다!',`
    };
    
    */

    async sendMail(mailOptions) {
        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email sent:', info.response);
            return info;
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }
}

module.exports = MailSendService;
