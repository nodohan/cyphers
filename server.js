global.logger = require('./config/winston');
var express = require('express');
var app = express();
var favicon = require('serve-favicon');
var path = require('path');

const api = require('./api');
const commonUtil = require('./controller/commonUtil');
const scheduler = require('node-schedule');
var maria = require('./config/maria');
let pool;

const loggerCatcher = require('./config/logger-catcher');
const logger = require('./config/winston');

//스케쥴러1. 매치리스트 
const matchScehduler = require('./controller/matchListScheduler')(scheduler, maria, loggerCatcher);

//스케쥴러2. 랭킹 크롤링
const rankScheduler = require('./controller/rankCrawlingScheduler')(scheduler, maria, loggerCatcher);

//랭킹 차트
const rankChart = require('./controller/rankChart')(scheduler, maria, loggerCatcher);

// 닉변이력
const userHistory = require('./controller/userHistory')(scheduler, maria, loggerCatcher);

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

app.get('/combi', function(req, res) {
    if (commonUtil.isMobile(req)) {
        res.render('./mobile/combi');
    } else {
        res.render('./pc/combi');
    }
});

app.get('/combiTotalCount', async function(req, res) {
    pool = await maria.getPool();

    try {
        let query = "SELECT COUNT(1) cnt FROM matches WHERE matchdate IS NOT NULL and season = '2021U' ";
        let [result] = await pool.query(query);
        res.send({ 'totalCount': result.cnt })
    } catch (err) {
        logger.error(err);
        return res
            .status(500)
            .send('오류 발생')
            .end();
        // [END_EXCLUDE]
    }

});

app.get('/combiSearch', async function(req, res) {
    let type = req.query.position;
    let count = 50;
    if (type == 'tankerJoin') {
        count = 100;
    } else if (type == 'attackerJoin') {
        count = 30;
    } else if (type == 'allJoin') {
        count = 4;
    }
    //당분간 조합 3건 이상만
    count = 3;

    let query = "SELECT *, CEILING( win / total * 100 ) AS late FROM ("
    query += "       SELECT ";
    query += "            " + type + " as combi, COUNT(1) total, COUNT(IF(matchResult = '승', 1, NULL)) win, COUNT(IF(matchResult = '패', 1, NULL)) lose ";
    query += "            , GROUP_CONCAT(detail.matchId) matchIds  ";
    query += "        FROM matchdetail detail ";
    query += "        inner join ( "
    query += "            select matchId, matchDate from matches where matchDate between '" + req.query.fromDt + "' and '" + req.query.toDt + "'  ";
    query += "        ) matches on matches.matchId = detail.matchId "
    query += "        WHERE 1=1 and season = '2021U' ";

    if (req.query.charName) {
        let charNames = req.query.charName.split(" ");
        for (idx in charNames) {
            query += "        and " + type + " like '%" + charNames[idx] + "%'	 ";
        }
    }
    query += "        GROUP BY " + type + " ";
    query += "    ) a  ";
    query += "    WHERE total >= " + count + " ";
    query += "    ORDER BY total DESC";

    logger.debug(query);

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