const api = require('./api');
var express = require('express');
var app = express();
const logger = require('./config/winston');


app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.use('/js', express.static(__dirname + "/js"));

const port = 8080;

const apiKey = 'G7eAqiszXGrpFFKWpKNxb6xZlmUyr8Rp';
var nickOpt = {
    uri: "https://api.neople.co.kr/cy/players",
    qs: { nickname: '마을주민1', wordType: 'full', limit: 30, apikey: 'G7eAqiszXGrpFFKWpKNxb6xZlmUyr8Rp' }
};
var playerInfo = {
    url: "https://api.neople.co.kr/cy/players/",
    qs: { apikey: 'G7eAqiszXGrpFFKWpKNxb6xZlmUyr8Rp' }
}

app.get('/', function(req, res) {
    if (isMobile(req)) {
        console.log("모바일이다!!");
        res.render('mobile.html');
    } else {
        console.log("PC다!!");
        res.render('main.html');
    }
}).get('/getUserInfo', function(req, res) {
    var nickname = req.query.nickname;
    nickOpt.qs.nickname = nickname;
    new api().call(nickOpt).then(async result => {
        console.log("사용자", result);
        let json = JSON.parse(result);

        if (json.rows == null || json.rows.length == 0) {
            res.send("{ 'resultCode' : -1 }");
            return;
        }

        let userId = json.rows[0].playerId;
        let gameType = req.query.gameType;
        var matchInfo = {
            url: "https://api.neople.co.kr/cy/players/#playerId#/matches",
            qs: { apikey: 'G7eAqiszXGrpFFKWpKNxb6xZlmUyr8Rp', gameTypeId: gameType, limit: 100, startDate: '2021-02-18 00:00', endDate: now() }
        }
        console.log("요청전의 endDate ", matchInfo.qs.endDate);

        matchInfo.url = matchInfo.url.replace("#playerId#", userId);

        var item = await getMatchInfo(matchInfo, null);
        res.send(item);
    });
});

function isMobile(req) {
    var ua = req.headers['user-agent'].toLowerCase();
    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(ua) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(ua.substr(0, 4))) {
        return true;
    }
    return false;
}

async function getMatchInfo(matchInfo, mergeData) {
    var result = await new api().call(matchInfo);
    console.log("뭐받음");
    var resultJson = JSON.parse(result);
    if (mergeData == null) {
        mergeData = resultJson;
    } else {
        mergeData.matches.rows = mergeData.matches.rows.concat(resultJson.matches.rows);
    }
    var next = resultJson.matches.next;
    if (next != null) {
        //console.log("NEXT가 있어요 ", next);
        matchInfo.qs.next = next;
        await getMatchInfo(matchInfo, mergeData);
    }

    return mergeData;
}

function now() {
    const curr = new Date();
    const utc = curr.getTime() + (curr.getTimezoneOffset() * 60 * 1000);

    // 3. UTC to KST (UTC + 9시간)
    const KR_TIME_DIFF = 9 * 60 * 60 * 1000;

    var date = new Date(utc + (KR_TIME_DIFF));
    var yyyy = date.getFullYear();
    var gg = date.getDate();
    var mm = (date.getMonth() + 1);

    if (gg < 10)
        gg = "0" + gg;

    if (mm < 10)
        mm = "0" + mm;

    var cur_day = yyyy + "-" + mm + "-" + gg;

    var hours = date.getHours()
    var minutes = date.getMinutes()
    var seconds = date.getSeconds();

    if (hours < 10)
        hours = "0" + hours;

    if (minutes < 10)
        minutes = "0" + minutes;

    return cur_day + " " + hours + ":" + minutes;
}

app.listen(port, () => {
    logger.info('Server START listening on port ' + port);
})