global.logger = require('./config/winston');
require("dotenv").config();

var express = require('express');
var app = express();
var favicon = require('serve-favicon');
var path = require('path');

const commonUtil = require('./server/util/commonUtil');
const scheduler = require('node-schedule');
var maria = require('./config/maria');
global.mariadb = maria;

const loggerCatcher = require('./config/logger-catcher');


//스케쥴러2. 랭킹 크롤링
const rankScheduler = require('./server/scheduler/rankCrawlingScheduler')(scheduler, maria, loggerCatcher);

// 시즌 오프 - 통계 구하기용
const seasonOff = require('./server/scheduler/seasonOffScheduler')(scheduler, maria, loggerCatcher);

// 사용자 검색
const userController = require('./server/controller/userSearchController')(scheduler, maria, loggerCatcher);

//랭킹 차트
const rankChart = require('./server/controller/rankChartController')(scheduler, maria, loggerCatcher);

// 닉변이력
const userHistory = require('./server/controller/userHistoryController')(scheduler, maria, loggerCatcher);

// 조합통계 
const combi = require('./server/controller/combiController')(scheduler, maria, loggerCatcher);

//스케쥴러3. 조합통계 - 주간/월간 (메인페이지용)
const statsSche = require('./server/scheduler/statsScheduler')(scheduler, maria, loggerCatcher);

// 포지션 특성 - 컨트롤러
const position = require('./server/controller/positionController')(scheduler, maria, loggerCatcher);

//스케쥴러3. 조합통계 - 주간/월간 (메인페이지용)
const stats = require('./server/controller/statsController')(scheduler, maria, loggerCatcher);

// 비공개 처리용
const nodo = require('./server/controller/nodoController')(null, maria, loggerCatcher);

// 스케쥴러4. 사용자 상세 통계
const userDetail = require('./server/scheduler/userDetailScheduler')(scheduler, maria, loggerCatcher);

// 스케줄러5. 매칭 유저 리스트 매핑
const matchUserScheduler = require('./server/scheduler/matchUserScheduler')(scheduler, maria, loggerCatcher);

// 스케줄러6. 시즌오프용
const statsSeasonSche = require('./server/scheduler/statsSeasonScheduler')(scheduler, maria, loggerCatcher);

// 비공개 처리용
const provider = require('./server/controller/providerController')(null, maria, loggerCatcher);

const matchMapScehduler = require('./server/scheduler/matchMapScheduler')(scheduler, maria, loggerCatcher);

const email = require('./server/controller/emailController')(scheduler, maria, loggerCatcher);

// 배치 통합
const batch = require('./server/scheduler/BatchScheduler')(scheduler, loggerCatcher);

// 캐릭 랭킹
const charRanking = require('./server/controller/charRankingController')(loggerCatcher);



app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.use(favicon(path.join(__dirname, 'ico', 'favicon.ico')))
app.use('/js', express.static(__dirname + "/js"));
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect 
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect 
app.use('/css', express.static(__dirname + '/css')); // redirect 
app.use('/mobile', express.static(__dirname + '/mobile')); // redirect 
app.use('/image', express.static(__dirname + '/image')); // redirect
app.use('/sitemap', express.static(__dirname + '/sitemap')); // redirect sitemap
app.use('/user', userController);
app.use('/rank', rankScheduler);
app.use('/matchesMap/', matchMapScehduler);
app.use('/rankChart', rankChart);
app.use('/history', userHistory);
app.use('/combi', combi);
app.use('/statsSche', statsSche);
app.use('/stats', stats);
app.use('/seasonOff', seasonOff);
app.use('/position', position);
app.use('/nodo', nodo);
app.use('/userDetail', userDetail);
app.use('/matchUser', matchUserScheduler);
app.use('/provide', provider);
app.use('/statsSeasonSche', statsSeasonSche);
app.use('/email', email);
app.use('/batch', batch);
app.use('/char', charRanking);

app.use(loggerCatcher());

const port = process.env.SERVER_PORT;

app.get('/', function(req, res) {
    commonUtil.getIp(req);
    if (commonUtil.isMobile(req)) {
        res.render('./mobile/stats');
    } else {
        res.render('./pc/stats');
    }
});

app.get("/robots.txt", (req, res) => {
    res.type("text/plain");
    res.send("User-agent: *\nAllow: /\nSitemap: http://doseh.co.kr/sitemap/sitemap.xml");
});


app.listen(port, () => {
    logger.info('Server START listening on port ' + port);
})
