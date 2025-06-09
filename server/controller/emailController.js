const commonUtil = require('../util/commonUtil');
const serivce = require('../service/MailSendService');
const logger = require('../../config/winston');
const rateLimit = require('express-rate-limit');

// 
module.exports = (scheduler, maria, acclogger) => {
    const app = require('express').Router();
    const emailService = new serivce();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const rateLimit = require('express-rate-limit');

    const emailLimiter = rateLimit({
      windowMs: 1 * 60 * 1000, // 1분
      max: 2, // 1분에 1회 제한
      message: 'Too many email requests, please try again later.',
    });

    app.use(acclogger());

    app.get('/sendMail', emailLimiter, function(req, res) {
        const { title, content, from } = req.query;

        if(!emailRegex.test(from)) {
            logger.info('이메일 형식이 아닙니다. %s', from);
            res.send({ "resultCode": "400", "resultMsg": "이메일 형식이 올바르지 않습니다." });
            return 
        }

        let resultCode = 200;
        try {
            emailService.sendMail({
                from: from,
                to: 'dododosa@naver.com',
                subject: title,
                text: from + "이 발송\n" + content,
            });
        } catch(err) {
            resultCode = 400;
            logger.error("메일발송실패 %s" , err);
        }
        res.send({ "resultCode": resultCode, "resultMsg": resultCode = 200 ?  "메일발송에 성공하였습니다." : "메일발송에 실패하였습니다." });
    });

    return app;
}