'use strict';

module.exports = () => {
    return (req, rep, next) => {
        logger.info('%s %s', req.method, req.url);
        // 미들웨어나 router 콜백에서 next 또는 response에 대한 응답을 생략하면 클라이언트가 계속 대기하게 되므로 꼭 잊지 말 것.
        next();
    }
};

// 출처: https://wedul.site/482#recentEntries [wedul]