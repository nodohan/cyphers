'use strict';
const repository = require('../server/repository/historyRepository');
const commonUtil = require('../server/util/commonUtil');

module.exports = () => {

    const suspiciousPatterns = [
        /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,                        // ', --, # 주석
        /(\%22)|(\")/i,                                          // "
        /\b(OR|AND)\b.+?=/i,                                     // OR a=1, AND a=1
        /\bUNION\b/i,
        /\bSELECT\b/i,
        /\bINSERT\b/i,
        /\bUPDATE\b/i,
        /\bDELETE\b/i,
        /\bDROP\b/i,
        /\bSLEEP\s*\(/i,
        /\bBENCHMARK\s*\(/i,
        /;.*$/i,                                                 // 끝에 ; 넣는 시도
      ];
    const historyRepository = new repository(mariadb);

    const isSuspicious = (url) => {
        const decoded = decodeURIComponent(url);
        return suspiciousPatterns.some((pattern) => pattern.test(decoded));
    };
    
    const insertHistory = (req, res) => {
        try {
          if (process.env.MOD !== 'REAL') return false;
      
          const url = decodeURIComponent(req.url);
      
          if (isSuspicious(url)) {
            const ip = commonUtil.getIp(req);
            logger.warn(`[SQL INJECTION] IP: ${ip}, URL: ${url}`);
            res.status(403).send('Forbidden');  // ← 여기를 위해 res 필요함
            return true;  // 차단됨
          }
      
          // 일반 로깅
          if (url !== '/' &&
              !url.startsWith('/view') &&
              !url.startsWith('/css') &&
              !url.startsWith('/js') &&
              !url.startsWith('/bootstrap')) {
            logger.info('%s %s', req.method, req.url);
            const ip = commonUtil.getIp(req);
            const safeUrl = sanitizeURL(url);
            historyRepository.insertAccessLog(ip, safeUrl);
          }
      
          return false; // 정상 흐름
        } catch (err) {
          console.log(err);
          return false;
        }
    };
      
      
    const sanitizeURL = (url) => {
        return url.replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;")
                  .replace(/"/g, "&quot;")
                  .replace(/'/g, "&#x27;")
                  .replace(/&/g, "&amp;");
    }
    
    return (req, res, next) => {
        const url = req.url;
        if(url.length > 128) {
          return;
        }

        const blocked = insertHistory(req, res);
        if (!blocked){
            next();  // 공격 감지된 경우 next() 호출하지 않음
        }
    };

};

// 출처: https://wedul.site/482#recentEntries [wedul]