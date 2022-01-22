global.logger = require('./config/winston');
var express = require('express');
var app = express();
var favicon = require('serve-favicon');
var path = require('path');

const api = require('./api');
const commonUtil = require('./server/util/commonUtil');
const scheduler = require('node-schedule');
var maria = require('./config/maria');
let pool;

const loggerCatcher = require('./config/logger-catcher');
const logger = require('./config/winston');

//스케쥴러1. 매치리스트 
const matchScehduler = require('./server/scheduler/matchListScheduler')(scheduler, maria, loggerCatcher);

//스케쥴러2. 랭킹 크롤링
const rankScheduler = require('./server/scheduler/rankCrawlingScheduler')(scheduler, maria, loggerCatcher);

//랭킹 차트
const rankChart = require('./server/controller/rankChartController')(scheduler, maria, loggerCatcher);

// 닉변이력
const userHistory = require('./server/controller/userHistoryController')(scheduler, maria, loggerCatcher);

// 조합통계 
const combi = require('./server/controller/combiController')(scheduler, maria, loggerCatcher);

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.use(favicon(path.join(__dirname, 'ico', 'favicon.ico')))
app.use('/js', express.static(__dirname + "/js"));
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap
app.use('/css', express.static(__dirname + '/css')); // redirect CSS bootstrap
app.use('/mobile', express.static(__dirname + '/mobile')); // redirect CSS bootstrap
app.use('/rank', rankScheduler);
app.use('/matches', matchScehduler);
app.use('/rankChart', rankChart);
app.use('/history', userHistory);
app.use('/combi', combi);

app.use(loggerCatcher());

const port = 8080;

app.get('/', function(req, res) {
    commonUtil.getIp(req);
    if (commonUtil.isMobile(req)) {
        res.render('./mobile/main', { 'searchNickname': req.query.nickname });
    } else {
        res.render('./pc/main', { 'searchNickname': req.query.nickname });
    }
});

app.get('/userDetail', function(req, res) {
    commonUtil.getIp(req);

    if (commonUtil.isMobile(req)) {
        res.render('./mobile/userDetail', { 'searchNickname': req.query.nickname });
    } else {
        res.render('./pc/userDetail', { 'searchNickname': req.query.nickname });
    }
});

app.get('/userVs', function(req, res) {
    commonUtil.getIp(req);

    if (commonUtil.isMobile(req)) {
        res.render('./mobile/userVs');
    } else {
        res.render('./pc/userVs');
    }
});

app.get('/getUserInfo', async function(req, res) {
    res.send(await new api().searchUser(req.query.nickname, req.query.gameType));
});

app.get('/getMatchInfo', async function(req, res) {
    res.send(await new api().searchMatchInfo(req.query.matchId));
});

app.get('/getNicknameHistory', async function(req, res) {
    let playerId = req.query.playerId;
    let query = "SELECT * FROM nickNames WHERE playerId = '" + playerId + "' order by checkingDate desc";

    pool = await maria.getPool();
    // [START cloud_sql_mysql_mysql_connection]
    try {
        let rows = await pool.query(query);
        res.send(rows); // rows 를 보내주자
    } catch (err) {
        // If something goes wrong, handle the error in this section. This might
        // involve retrying or adjusting parameters depending on the situation.
        // [START_EXCLUDE]
        logger.error(err);
        return res
            .status(500)
            .send('오류 발생')
            .end();
        // [END_EXCLUDE]
    }
});

app.get('/userChart', function(req, res) {
    commonUtil.getIp(req);

    res.render('./pc/userChart');
});

app.listen(port, () => {
    logger.info('Server START listening on port ' + port);
})