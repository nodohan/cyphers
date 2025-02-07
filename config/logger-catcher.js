'use strict';
const repository = require('../server/repository/historyRepository');
const commonUtil = require('../server/util/commonUtil');

module.exports = () => {

    const historyRepository = new repository(mariadb);
    const insertHistory =  (req) => {
        try {
            if(process.env.MOD == "LOCAL") {
                return;
            }
            const url = req.url;
            if (url != "/" 
                && !url.startsWith('/view') 
                && !url.startsWith('/css') 
                && !url.startsWith('/js') 
                && !url.startsWith('/bootstrap') ) {
                logger.info('%s %s', req.method, req.url);
                const ip = commonUtil.getIp(req);
                const url = sanitizeURL(decodeURI(req.url));                
                historyRepository.insertAccessLog(ip,url);
            }
        } catch(err) {
            console.log(err);
        }
    }

    const sanitizeURL = (url) => {
        return url.replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;")
                  .replace(/"/g, "&quot;")
                  .replace(/'/g, "&#x27;")
                  .replace(/&/g, "&amp;");
    }
    
    return (req, rep, next) => {        
        insertHistory(req);
        // 미들웨어나 router 콜백에서 next 또는 response에 대한 응답을 생략하면 클라이언트가 계속 대기하게 되므로 꼭 잊지 말 것.
        next();
    }

};

// 출처: https://wedul.site/482#recentEntries [wedul]