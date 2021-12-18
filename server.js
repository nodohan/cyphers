global.logger = require('./config/winston');
var express = require('express');
var app = express();
const api = require('./api');
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


app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.use('/js', express.static(__dirname + "/js"));
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap
app.use('/css', express.static(__dirname + '/css')); // redirect CSS bootstrap
app.use('/mobile', express.static(__dirname + '/mobile')); // redirect CSS bootstrap
app.use('/rank', rankScheduler);
app.use('/matches', matchScehduler);
app.use('/rankChart', rankChart);

app.use(loggerCatcher());

const port = 8080;

app.get('/', function(req, res) {
    getIp(req);
    if (isMobile(req)) {
        res.render('./mobile/main', { 'searchNickname': req.query.nickname });
    } else {
        res.render('./pc/main', { 'searchNickname': req.query.nickname });
    }
});

app.get('/userDetail', function(req, res) {
    getIp(req);

    if (isMobile(req)) {
        res.render('./mobile/userDetail', { 'searchNickname': req.query.nickname });
    } else {
        res.render('./pc/userDetail', { 'searchNickname': req.query.nickname });
    }
});

app.get('/userVs', function(req, res) {
    getIp(req);

    if (isMobile(req)) {
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
    if (isMobile(req)) {
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
    getIp(req);

    res.render('./pc/userChart');
});

function getIp(req) {
    const ip = req.headers['x-forwarded-for'] || req.ip;
    logger.debug("아이피: %s", ip);
    return ip;
}

function isMobile(req) {
    var ua = req.headers['user-agent'];
    if (ua == null) {
        return false;
    }

    ua = ua.toLowerCase();
    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(ua) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(ua.substr(0, 4))) {
        return true;
    }
    return false;
}

app.listen(port, () => {
    logger.info('Server START listening on port ' + port);
})