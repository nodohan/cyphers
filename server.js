const api = require('./api');
var express = require('express');
var app = express();
const logger = require('./config/winston');

//var maria = require('./maria');
let pool;

//const maria = require('mysql');
const maria = require('promise-mysql');

// [START cloud_sql_mysql_mysql_create_tcp]
const createTcpPool = async config => {
    return await maria.createPool({
        host: '114.207.113.136',
        port: 3306,
        user: 'nodo',
        password: 'P@ssw0rd',
        database: 'cyphers'
    });
};
// [END cloud_sql_mysql_mysql_create_tcp]

const createPool = async() => {
    const config = {
        // [START cloud_sql_mysql_mysql_limit]
        // 'connectionLimit' is the maximum number of connections the pool is allowed
        // to keep at once.
        connectionLimit: 5,
        // [END cloud_sql_mysql_mysql_limit]

        // [START cloud_sql_mysql_mysql_timeout]
        // 'connectTimeout' is the maximum number of milliseconds before a timeout
        // occurs during the initial connection to the database.
        connectTimeout: 10000, // 10 seconds
        // 'acquireTimeout' is the maximum number of milliseconds to wait when
        // checking out a connection from the pool before a timeout error occurs.
        acquireTimeout: 10000, // 10 seconds
        // 'waitForConnections' determines the pool's action when no connections are
        // free. If true, the request will queued and a connection will be presented
        // when ready. If false, the pool will call back with an error.
        waitForConnections: true, // Default: true
        // 'queueLimit' is the maximum number of requests for connections the pool
        // will queue at once before returning an error. If 0, there is no limit.
        queueLimit: 0, // Default: 0
        // [END cloud_sql_mysql_mysql_timeout]

        // [START cloud_sql_mysql_mysql_backoff]
        // The mysql module automatically uses exponential delays between failed
        // connection attempts.
        // [END cloud_sql_mysql_mysql_backoff]
    };

    return await createTcpPool(config);
};

const ensureSchema = async pool => {
    await pool.query(`SELECT 1;`);
};

const createPoolAndEnsureSchema = async() =>
    await createPool()
    .then(async pool => {
        await ensureSchema(pool);
        return pool;
    })
    .catch(err => {
        logger.error(err);
        throw err;
    });



app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.use('/js', express.static(__dirname + "/js"));
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap
app.use('/css', express.static(__dirname + '/css')); // redirect CSS bootstrap
app.use('/mobile', express.static(__dirname + '/mobile')); // redirect CSS bootstrap

const port = 8080;

var seasonStartDay = '2021-02-18 00:00';
const apiKey = 'G7eAqiszXGrpFFKWpKNxb6xZlmUyr8Rp';
var nickOpt = {
    uri: "https://api.neople.co.kr/cy/players",
    qs: { nickname: '', wordType: 'match', limit: 3, apikey: 'G7eAqiszXGrpFFKWpKNxb6xZlmUyr8Rp' }
};

app.get('/', function(req, res) {
    if (isMobile(req)) {
        console.log("모바일이다!!");
        res.render('./mobile/main', { 'searchNickname': req.query.nickname });
    } else {
        console.log("PC다!!");
        res.render('main', { 'searchNickname': req.query.nickname });
    }
});

app.get('/test', function(req, res) {
    if (isMobile(req)) {
        console.log("모바일이다!!");
        res.render('./mobile/test');
    } else {
        console.log("PC다!!");
        res.render('test');
    }
});

app.get('/userDetail', function(req, res) {
    //res.json();

    if (isMobile(req)) {
        console.log("detail 모바일이다!!");
        res.render('./mobile/userDetail.html', { 'searchNickname': req.query.nickname });
    } else {
        console.log("detail PC다!!");
        res.render('userDetail', { 'searchNickname': req.query.nickname });
    }
});

app.get('/userVs', function(req, res) {
    //res.json();

    if (isMobile(req)) {
        console.log("userVs 모바일이다!!");
        res.render('./mobile/userVs');
    } else {
        console.log("userVs PC다!!");
        res.render('userVs');
    }
});

app.get('/matches', function(req, res) {
    console.log("userVs PC다!!");
    res.render('matches');
});

app.get('/stats', function(req, res) {

    if (isMobile(req)) {
        console.log("userVs 모바일이다!!");
        res.render('./mobile/userVs');
    } else {
        console.log("userVs PC다!!");
        res.render('stats');
    }
});

app.get('/getUserInfo', function(req, res) {
    var nickname = req.query.nickname;
    nickOpt.qs.nickname = nickname;
    //console.log(nickOpt);

    new api().call(nickOpt).then(async result => {
        //console.log("사용자", result);
        let json = JSON.parse(result);

        if (json.rows == null || json.rows.length == 0) {
            res.send("{ 'resultCode' : -1 }");
            return;
        }

        let userId = json.rows[0].playerId;
        let gameType = req.query.gameType;

        var result = null;
        let diffDay = dateDiff(seasonStartDay, new Date());
        let startDate = seasonStartDay;
        let endDate = getMinDay(addDays(startDate, 90), new Date());

        while (diffDay >= 0) {
            result = mergeJson(result, await getUserInfoCall(userId, gameType, startDate, endDate));
            startDate = endDate;
            endDate = getMinDay(addDays(startDate, 90), new Date());
            diffDay = diffDay - 90;
        }
        res.send(result);
    });
});

app.get('/getMatchInfo', function(req, res) {
    var matchOpt = {
        uri: "https://api.neople.co.kr/cy/matches/",
        qs: { apikey: 'G7eAqiszXGrpFFKWpKNxb6xZlmUyr8Rp' }
    }
    matchOpt.uri += req.query.matchId;
    new api().call(matchOpt).then(async result => {
        //console.log("match", result);
        console.log("match 받음");
        res.send(JSON.parse(result));
    });
});


app.get('/combi', function(req, res) {
    if (isMobile(req)) {
        res.render('./mobile/combi');
    } else {
        res.render('combi');
    }
});

app.get('/combiTotalCount', async function(req, res) {

    pool = pool || (await createPoolAndEnsureSchema());
    // [START cloud_sql_mysql_mysql_connection]
    try {
        let query = "SELECT COUNT(1) cnt FROM matches WHERE matchdate IS NOT NULL and season = '2021U' ";
        let [result] = await pool.query(query);
        res.send({ 'totalCount': result.cnt })
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

app.get('/combiSearch', async function(req, res) {
    let type = req.query.position;
    let count = 50;
    if (type == 'tankerJoin') {
        count = 100;
    } else if (type == 'attackerJoin') {
        count = 50;
    } else if (type == 'allJoin') {
        count = 4;
    }


    let query = "SELECT *, CEILING( win / total * 100 ) AS late FROM ("
    query += "       SELECT ";
    query += "            " + type + " as combi, COUNT(1) total, COUNT(IF(matchResult = '승', 1, NULL)) win, COUNT(IF(matchResult = '패', 1, NULL)) lose ";
    query += "            , GROUP_CONCAT(matchId) matchIds  ";
    query += "        FROM matchdetail  ";
    query += "        WHERE 1=1  ";
    if (req.query.charName) {
        let charNames = req.query.charName.split(" ");
        for (idx in charNames) {
            query += "        and " + type + " like '%" + charNames[idx] + "%'	 ";
        }
    }
    query += "        GROUP BY " + type + " ";
    query += "    ) a  ";
    query += "    WHERE total >= " + count + " ";
    query += "    ORDER BY late DESC";

    pool = pool || (await createPoolAndEnsureSchema());
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


//

app.get('/getNicknameHistory', async function(req, res) {
    let playerId = req.query.playerId;

    let query = "SELECT * FROM nickNames WHERE playerId = '" + playerId + "' order by checkingDate desc";

    pool = pool || (await createPoolAndEnsureSchema());
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


async function getUserInfoCall(userId, gameType, startDate, endDate) {
    var matchInfo = {
            url: "https://api.neople.co.kr/cy/players/#playerId#/matches",
            qs: { apikey: 'G7eAqiszXGrpFFKWpKNxb6xZlmUyr8Rp', gameTypeId: gameType, limit: 100, startDate: startDate, endDate: endDate }
        }
        //console.log("요청전의 endDate ", matchInfo.qs.endDate);

    matchInfo.url = matchInfo.url.replace("#playerId#", userId);

    var item = await getMatchInfo(matchInfo, null);
    return item;
}

function isMobile(req) {
    var ua = req.headers['user-agent'].toLowerCase();
    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(ua) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(ua.substr(0, 4))) {
        return true;
    }
    return false;
}

async function getMatchInfo(matchInfo, mergeData) {
    var result = await new api().call(matchInfo);
    //console.log("뭐받음", result);
    var resultJson = JSON.parse(result);
    mergeData = mergeJson(mergeData, resultJson);
    var next = resultJson.matches.next;
    if (next != null) {
        //console.log("NEXT가 있어요 ", next);
        matchInfo.qs.next = next;
        await getMatchInfo(matchInfo, mergeData);
    }

    return mergeData;
}

function mergeJson(mergeData, resultJson) {
    if (mergeData == null) {
        mergeData = resultJson;
    } else {
        mergeData.matches.rows = mergeData.matches.rows.concat(resultJson.matches.rows);
    }

    return mergeData;
}

app.listen(port, () => {
    logger.info('Server START listening on port ' + port);
})


// 두개의 날짜를 비교하여 차이를 알려준다.
function dateDiff(_date1, _date2) {
    var diffDate_1 = _date1 instanceof Date ? _date1 : new Date(_date1);
    var diffDate_2 = _date2 instanceof Date ? _date2 : new Date(_date2);

    diffDate_1 = new Date(diffDate_1.getFullYear(), diffDate_1.getMonth() + 1, diffDate_1.getDate());
    diffDate_2 = new Date(diffDate_2.getFullYear(), diffDate_2.getMonth() + 1, diffDate_2.getDate());

    var diff = Math.abs(diffDate_2.getTime() - diffDate_1.getTime());
    diff = Math.ceil(diff / (1000 * 3600 * 24));

    return diff;
}

function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function getMinDay(date1, date2) {
    return date1.getTime() < date2.getTime() ? date1 : date2;
}