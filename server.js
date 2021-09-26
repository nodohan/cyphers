const api = require('./api');
var express = require('express');
var app = express();
global.logger = require('./config/winston');
const scheduler = require('node-schedule');

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

const loggerCatcher = require('./config/logger-catcher');

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.use('/js', express.static(__dirname + "/js"));
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap
app.use('/css', express.static(__dirname + '/css')); // redirect CSS bootstrap
app.use('/mobile', express.static(__dirname + '/mobile')); // redirect CSS bootstrap
app.use(loggerCatcher());

const port = 8080;

var seasonStartDay = '2021-02-18 00:00';
const apiKey = 'G7eAqiszXGrpFFKWpKNxb6xZlmUyr8Rp';
var nickOpt = {
    uri: "https://api.neople.co.kr/cy/players",
    qs: { nickname: '', wordType: 'match', limit: 3, apikey: 'G7eAqiszXGrpFFKWpKNxb6xZlmUyr8Rp' }
};

app.get('/', function(req, res) {
    getIp(req, "main");
    if (isMobile(req)) {
        res.render('./mobile/main', { 'searchNickname': req.query.nickname });
    } else {
        res.render('main', { 'searchNickname': req.query.nickname });
    }
});

app.get('/userDetail', function(req, res) {
    getIp(req, "userDetail");

    if (isMobile(req)) {
        res.render('./mobile/userDetail', { 'searchNickname': req.query.nickname });
    } else {
        res.render('userDetail', { 'searchNickname': req.query.nickname });
    }
});

app.get('/userVs', function(req, res) {
    getIp(req, "userVs");

    if (isMobile(req)) {
        res.render('./mobile/userVs');
    } else {
        res.render('userVs');
    }
});

app.get('/matches', function(req, res) {
    res.render('matches');
});

app.get('/stats', function(req, res) {

    if (isMobile(req)) {
        res.render('./mobile/userVs');
    } else {
        res.render('stats');
    }
});

app.get('/getUserInfo', function(req, res) {
    var nickname = req.query.nickname;
    nickOpt.qs.nickname = nickname;
    //logger.debug(nickOpt);

    new api().call(nickOpt).then(async result => {
        //logger.debug("사용자", result);
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
    query += "            , GROUP_CONCAT(matchId) matchIds  ";
    query += "        FROM matchdetail  ";
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



//스케쥴러 또는 웹 url call
//var time = "40 23 * * *";
var time = "30 23 * * *";
var job = scheduler.scheduleJob(time, function() {
    logger.info("call scheduler");
    insertMatches();
    logger.info("end scheduler");
});

app.get('/insertMatches', function(req, res) {
    let allowIps = ["localhost", "127.0.0.1", "221.143.115.91", ":114.207.113.136", "::1", "::ffff:127.0.0.1", "34.64.4.116"];
    const ip = req.headers['x-forwarded-for'] || req.ip;

    if (ip.indexOf(",") > 0) {
        ip = ip.toString().split(",")[1].trim();
    }

    logger.debug("call insertMatches ip", ip);
    if (!allowIps.includes(ip)) {
        return res
            .status(403)
            .send('Not allow IP :' + ip + ' \n')
            .end();
    }

    return insertMatches(res);
});

async function insertMatches(res) {
    var target1 = ['ㅡFURYㅡ', '꼰대맨', '클리브원챔픽신령', '카고', '지옥의군주흒근', '송은조', '미니쉘딸기', '그랑바뜨망', '스컬', '나원딜할뀨', '한실란', '헬창드렉', '하고싶은대로해', '새촘2', '박병목탁', 'LLEYTON6', '권지애', '동마토재배꾼', '죽기전에사퍼한판', '즈밥레기', '웨맘의도시락반찬', '빵또앙', '빵빠렝', '느지막이', '잭스뽀삐뽀삐털', '무케남편', '강유나', '통영친구', '산돌림', '리그린', '빵그렝', '똘똘이', '포모스ㅡ박병목', 'MulYak', '오르목길', '황선우', '향천', '근딜안주면걍던짐', '뜬', '대머리원딜', '바알트', '억장와르륵탱커', '전체주의', '할아버지피지컬', '밥주', '눈물이많은물티슈', '새마을운동', 'NEXCARE', '수댬', '캐릐', '집중사격', '디렉터ㅡ김동욱', '암각ㅣ영상승룡파', 'ㅡRAGEㅡ', '우교', 'RoHail', '본계근딜연습중', '하하열받네', '송이한', '린이지켜줄게', '앙앙이소리', '방울패왕', '역대코들짜', '싹싹이', '이음새', '열중셧', '잭스뽀삐뽀뻐털', '키갈황제김동욱', '떡뽁기', '너흰모르는부캐', '문성진짜원딜잘함', '최엑스', '엔젤푸딩', '돌림산', '꿈들', '스탠딩에그23', '성보', '셤이', '흑인프로게이머', '호롤로대장', '초코멜', '이분희', '떼굴섬', 'PSK', '죽창포로링', '찐빵빠레', 'nur2koow', '흑룡로라스', '소란한밤', '고얌미', '맛있게생겼네', '베카', 'EDMOOND', '아픈딜러', '남노예님', '씨익씨익잇몸만개', '명존쎄박고싶다', '무상성클리브', '네간', '학뀨뀨잉', '도움따위', '믄', 'ㅡCryptoㅡ', '허첵', '인간탄약', '수고해랑', '군성', '아기삐약이', '달져', '공방폭언수행', '멘수', '어디갔어내탄피ㅠ', '요정도', '하명', '별콤이', 'INFPㅡA', '경선식', '신정핸', '2021롯데우승', '쇠사슬여왕블랑카', '언덕위에곰돌이', '나개싸이코임', '방패로패드립니다', '웜련', '프랩', '응애퀴엠', '난버푸', 'AIyak', '으I사', '찡팔', '타라필패ㅡ김동욱', '기왓', '검측', 'ㅢㅡㅢㅡㅢ', '늘너랑', '일덩익낭라어서오', 'wook2run', '쬬율', '힘내서가작', '그늘바람꽃', '2재훈', '원챔미시박옥녀', '장충동', '주색', '박살내기', '더럽다', '누링라이프', '예의를지키는신사', '떡갈비마요덮밥', '제약영업대리', '응원', '민초단학미', '갓천', '섀하', '역전할맥고양이', '팥도리', '요룔로료롤', '천황차사', '팔꿈치는엘보우', '애눙', '부쉬에숨다', '씨앙연', 'Bdosin', '극장공연의여신', '뭉미란', '포재', '수희', '뜨끈한국밥탱', '준과함께사라지다', '나는싸이코', '차우니', '와이존을향해', '알파카는귀여웡', '미국', '밤의황제김동욱', 'ㆅK', '창고캐릭', '예쁜말만하는사람', '생각하고채팅치자', '기도라', '대머리탱커', '승리의호흡', '끼순', '알쯔', '927', '카카오미니', '긴사색의시간ㅿ', '얌뚱', '골드만가도평타', '등근육', '다음스텝', '장미운전', '올바른사용법', '죽창너부리', '멈출수없는손놀림', 'KFA', '9차단귓거부', '발리스타', '푸요미', '98현', 'PX골리앗', '정언', '단밤사장', '한국남자김동욱', '더기팬클럽', '곰도일푸', '0I동', '달콤한집사', '혜지한테지면', '섹시한바이러스', 'YakMul', 'ㅡ원숭이ㅡ', '빛을새긴흔적', '이버멍', '귀염뽀짝응애단', '김한빛', '노간주', 'mission', '편식안하는저격대', '정규직라이터', 'TaiDi', '유하진', '쓰레기UI패치', '즁간고앵이', '발넘', '동마토', '응애나애기두루미', '팀운가챠게임', '강남나그네', '선율아', '혜승이짱', '인사하면트롤안함', '준승', '극한직업탱커요', '뷁뛝', '명진몬', '공성지원부댸', '아령히계세연', '죽1창', '솔랑솔랑', '사태드', '이중에서한가지', '아빙', '전격인', '강훈민', '문성고', '불타는오징어', '2OO', '비오는날행복', '타협따윈', '윤대로', '가훈', '사퍼', '윈터테일', '애기응애단', '잭올란드', '홀든이글', '리지뉴', '관영짱123', 'IceForce', '떼굴방', '청순섹시보이겅베', '장조림알러지숭이', '새해결심', '무카무카', '갈릭원딜파이', '데헷ㅇ3ㅇㅋㅋ', 'CieI', 'SuperJam', '오리친구들', '쎄', '시라카미후부키', '방전', '퀭리', 'PenareaL', '양세종', 'KIMHEKIM', '비주류원딜', 'Rotc곰', 'IOO4', '왕자림', 'DG', '긍정적인사람', '예아안될꺼뭐잇노', '김극혐', '킬라이프ㅡ투견ㅡ', '문어의꿈', '쌍에', '쏘리', 'Askiol', '범계', '효설', '해림', '물리화학선생님', '염라대장', '라면장사아저씨', 'Rlo', '황몽이', '부계', '아침잠', 'Chongai', '왕동탁', '노슨식부엉이에듀', '구타전문', '전설', '허세정현', '하루가', '깨루', '밀당', '못해도탓하지말자', '브실골구세주', 'ㅱllIIlIㅱ', '오만', '채찍녀구속플레이', '들기름름기참', '김흥국', '삼킹', '1107', '무하마드웨슬리', '펭끤', 'Moon', 'I4I', '소셜이', '수창의미', '남탓충다디졌으면', '마법소녀불우이웃', '띠몽', '정신놓을거같아', '근딜양보절대안함', '이뮨', '김정호', '나는혜지야', '상자', '헬린이샆린이', '티미의수호천사s', '말썽혜승', '올랴운더', 'MF', '그래서님티어는', '중독적', '박서', '미래가어두운게임', '뉴비맞아요믿으셈', '로스터리라떼', '품격을지키는신사', '경문식', '슬픈꽃잎', 'Lruoue', '참이슬에빠진파닭', '노안왔음', '까망베르치쥬', '응애나아기트롤', '기떡볶이', 'Voden', 'ㅣ유리멘탈ㅣ', 'Champ2On', '푸용', '동네빵집', '내목숨을와이존에', '환상적', '뭉치구독좋아요', '이멜', '정열의살타', 'popo에서', '뽀로', '포모스ㅡ박병못', '동작그만밑장빼기', '헌혈', '타조', '박박대머리', '몽뀨', '됴선', '들개', '곧휴가떠나요', '단무징', '으뜸', '검찰', '내이름은백종우', '소드아트온라인', '홍리나', '37세희선맘', '빵이', '탱커벨곰주님', 'VLTN', '승리의참철또', '어디갔어내탄피ㅜ', '잲', '서리낀유리창', '척추수술삼천칠백', '민세연', 'ㅇㅅㅇ응애', '딜러추적ㅡ김둑치', '뚜빠이', '낭만적', '아랃', '미래', '근딜버스', '별드니스', '스텔라여자친구', '혼란한', '레베카주인', '오버패골드', '앙앙거리네', '까요태', '김호탁', '스윽충', '투자엑스퍼트', '포항사나이', '카멜그레이', '비가어는날앤', '분열로주님곁으로', '아이잒', 'Needles', '호이호이상', '해조해조', '황혼의칼날', '슈타이어', 'Rusp', '장군님지뢰까신다', '잃을거없는놈', '사랑하고축복해', '꼬꼬마', '준호학개론', '널위한꽃한송이', '너의궤양', '추격인', '파란만장도넛', '티엔깎는장인', '뽀록신', '듄', '홍돌콩', '이문식', '씨ㄱㄴㄷㄻ바', '하트히트', 'ㅡSINㅡ', '최두나', '캬루룽', '호애애앵', '승리의참철도', '나이제', 'ㅋㅋ정지시켜봐라', '단종', '브룸베어', '사이퍼즈바이바이', '주짓수브라운벨트', '샆그루', '치카', '레신', '웨병슬신리', '킹클럽에이스춘자', 'ㅁㅣ친개', '앤린', '성꽝', '참지않는사람', '세상참좋아졌어', 'Fenomeno', 'S급게이', 'Aㅏ웃경', '묠', '스윙스의굿밤키스', '내게남은세가지', '럭키맹', '그날본꽃의이름을', '스피드영철1', '붱붱이', '술먹으면접속하는', '사랑으로합시다', '별혜지', '웜년', '욤마머꼬', '캐리빌런', 'KANGYO', '콰르텟', 'WNMNMNWN', '장미처럼2', '뚹뚹', '뉵챠', '점순이네봄감자', 'ingleblc', 'NINA', '다복치', '아프니까탱커한다', '라스트픽', 'O데스', '부두교의가르침', '사랑ㆁ', '라면맛마카롱', '세잔느', '첸버', '댕거북', 'netflex', '동지하', '호자', '151020입대', 'ENsent', '통나무집제이씨', '현호형재윤이형', '변재성', '깝죽힝', '강재구', '솜과자', '드타갓', '충격력', '달건이', '갤러리아', '캡스락메이플사냥', '포비크', '탱커하실분', '마님의불빠따돌쇠', '나혼자쌌다', '은향시류', '돈깡', '모동숲에진심인편', '빌런은입열지마', '도슬이', 'HatKid', '소르마', '떠이', '렌시스', '세라리안', '앙리마이뉴', '슬룩', '도세도현', '게임중독심술뽀', '현생을살자', 'WISHLIST', '하얏', '진딧물', '텐겐', 'Moonging', '방엘리', '권팔상', '종로폭격기김두한', '뵹', 'Aria', '뚜렛장애', '검률', 'IRUHA2호', '제난', '냐꼬', '모래발굽물동이꾼', '학미', '래뷧', '칫솔', '차단즐겜', '놀아줘공주', '훈형s', '삼림', '근접원딜', '우잉에잉', 'SUP0RT', '가즈a', '경고먹음', '뻘글', '우물쭈물이', '두제눔얀봋고태', '왈옹', '뀨렌징빔', '정환토스트', '민뭉이', '잉글랜드', 'ㄴ맑은청정수ㄱ', '꾸안꾸', '뽕쁘라단속반', 'ㄷHㄱI중', '아카이스이세이', '쑈미더염라대왕', '이매조', 'feisty', '해전드', '오줌발싸히히', '서대문개목걸이', '진l쿠노이치', '추아화홯', 'i5린필드750', '레몬앤페퍼', '힝곰', '매지시즈', '라샌러', '읏치', '유름', '강한돌덩이', '한양', '사탄클로스', '르르치', '양서윤', 'Anastasa', '드렉쓰', '짝포', '리겔', '추적', '핑마', '귀여운웨슬리', '외로운주먹원우', '낙원', '한권이의펜싱교실', '즐겜캐로진지하게', '앞만보는혜지', '우주스타ㅡ타이슨', '제2의인격감캐밭', '드락5', '바보사랑', '담동', '관세사', '최민현', '이타주의', 'Rige', '하드개리', '건강명예행복', '섭곰', '나잡으러와라', 'LuIIaby', '자학', '종필', '꿽걣쀑퉰훭궱꿹뿳', '밀릭', '팥혁', '스파일럿', '해양과학', '이제희', '칼파랑', '견습술사', '전주형', '월요일이온다', '송죽비빔밥', '맛있는초코라떼', '사퍼는질병이다', '서은혁', '꼬우신가용', '레전드', '그성별이해불가', 'S급전기쟁이', 'ㅡ이근ㅡ', '딜러님1', '두둥이', '여미새', 'NO브레이크', 'CELTICS', '양노을', '삼룡OI와이유', '레튼맨', '리린', '특종추적자', '근막경선해부학', '메뚜기가우우우', '좋은말만하는사람', '외눈서약', '파티하고프면귓해', '이해좀시켜줘', '지켜주고있잖아', '댕헿', '굴러가라', '미락', '으유졸보', '선원유', 'WOOL', '이때아차싶더라고', 'dobo', '아모르겠다', '마법소녀ㅣ조마', '직속상사', '팬더가죽을쓴여우', '부캐아니고본캐', '딮블랙', '나일강', 'CL10OT영웅', '이효빈', '채금먹고반성중', '나도만질꺼야', '1주년을함께한', '민쟈', '야채먹는육식동물', '아카토리노', '깐주', 'MAXlM', '해푸', '사랑의메뉴얼', '부산남자아이가', '이지은와딸기와차', '쬬꾜빵', '뉘들이닭맛을알아', 'rrIlIIlI', '비올레토', '김동욱바라기', 'Ksㅡeva', '화룡이1052', '아재옥', '한번더해요', '노룩간지', '인리샤감캐밭', '사촌', '늘게', '행복지수', '음ZI', '본드래곤', 'YeongDae', '뿌뿌공성합니다', '리얼핫걸쓋', '대형냉장고', 'ㅓOㅅOㅏ', '시네마', '아몬드크랜베리', '전설의옥스혼전사', '머가좋지', '돌든애', '섹랭님', '쌍준', '허건우', '귀여워기여워', '떡님', '난탱커다', '절제', '하랜', '사탈지', '배레온', '강나로', '댓', '어치', '금지된서적', '바덮쿤은지영이꺼', '레무', '섬서', '솔요', '붕흔', 'LeiKo', '오버패는탱커하셈', 'Dulip', '마카롱늑대크아앙', '오륜서', '별리하', '핑미핑미', '레몬e', '포메솜', '푹신폭신', '유확', '설유화려', '클라이머MAC', 'MeltMe', '눈치보기만렙', '커피마카롱', 'NII', '말해도몰라요', '난리난리개난리', '진우동사리', '무뇌지절성', '현동님', '간1지', 'ㅱilIIIil', '머쓰마', '기적의바나나', '부곜', '견인', 'ㄷH마왕', '삐까뻔쩍삐까파쮸', '졔리뽀', '아사누나거긴안돼', '댕댕고양이', '버티면부러져요', '엘리는아가야', 'ㅋㅎㅋㅎㅎㅋ', '테라듀소녀', '바니걸을찬양해라', '9차단묵언수행', '라이트닝가이드', '장뚜이', '동쪄니', '미인', '원리', '취준생', '검보라', '갓토', '꼬우면부캐파던가', '살려주세여어엉', '뜨거운광호', '제닉스ㅡ말미잘정', '거대설화', '김뚜들', 'Nethen', '으쯔라구요', '나참', '비요르', '김규이', '모르모트', '마포대교오태식', '존함', 'SNUarchi', '항상포기하지말자', 'Toter', '불꽂남자', '정렬', '케로로ㅡ중사', '선두', '먼몽', '꿀꿀문어', 'ㅡAnnㅡ', '요시', '뭏뭏', '민민테무르', '우리집개는나란다', 'Routes', '릿카츄', '츄코', '샤흐', '랭킹', '침묵형탱커', '봉칠', '마력의루이스', '만져', '사퍼는망겜입니다', '뚱2', '삼불', '낚였다', '뉴메타창시자', '처음은아파요', '손주연', '지르키', '밤여우', '믺이', '여화', '금사식', 'Lampard8', 'KillDead', '무새앵', '쫀득쫀득떡토끼', '고3킬러김지눈', '아리송시헌', '흑간남', '양학선장', '기어가던개미', '나는바보', '한영화', '덤비면죽는다내가', '김이화', '들꽃잎', '코야롱', '암웨이', '벼량위의당뇨', '쨔링', '남춘봉', '동물사전', '최은', 'ㅇㅅㅇ킁', '피묻은레나다리', 'SteveP', 'DAMㅡN', '가슴', '호수위의얼음요정', '전뒷치기가좋아요', '토끠넛라떼', '강포비', '재홍', '밤주나', '뉴비는못말려', 'Skura', '공작화', '허스코기', '두두새', '누누의모험', '한켱', '아빠상어', '설딩', '1008', '죽창너구리', '파푸니카족장', '이학주', '배신자ㅡ캬루', '조물딱', '밥주려고웨슬리함', 'I8', '희강', '공식괴물편도일', '닥처뭘바꺼저', '배구', 'ㅅㅎㅇ', '홍신휘', '류승룡김옥지', '신승휴', '타라버스타라', '한여름밤의율', '이요한', '철인왕후넘모잼써', '짱긔', '이건뭔겜이냐', '엘리니아모범택시', '둡향', '삼닭탕', 'aCey', '모두진정해버렷', '떡갈비김치덮밥', '이겨야즐겜이지', '근수저', '필름', '씸판', 'huni', '윈터킬', '마시로', '상츄쿵야', '방탄소년단김태형', '텑', '리오린', '무하마드로라스', '마짱2등', '아르가스', 'Zone수', '비담이', '위스키', 'ㅡ고양이ㅇㅅㅇ', '가지', '조선의실버판테온', '누성', '살ㅡ인ㅡ마', '발렌타인'];
    let query = "SELECT playerId FROM nickNames WHERE nickname in ( '" + target1.join("','") + "') order by checkingDate desc";

    pool = pool || (await createPoolAndEnsureSchema());
    try {
        let rows = await pool.query(query);
        let result = mergeMatchIds(rows);
        res.send(result > 0); // rows 를 보내주자
    } catch (err) {
        logger.error(err);
        if (res != null) {
            return res
                .status(500)
                .send('오류 발생')
                .end();
        }
    }
}


function timestamp(date) {
    date.setHours(date.getHours() + 9);
    return date.toISOString().replace('T', ' ').substring(0, 16);
}

async function mergeMatchIds(rows) {
    let yesterday = timestamp(addDays(new Date(), -1));
    let today = timestamp(new Date());

    //사용자 매칭 데이터 검색 
    let promiseItems = [];
    for (idx in rows) {
        let playerId = rows[idx].playerId;
        let time = idx * 50;
        let item = new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(getUserInfoCall(playerId, "rating", yesterday, today));
            }, time);
        });
        promiseItems.push(item);
    }

    //검색 결과 Merge 후 matchId insert 
    Promise.all(promiseItems).then(resultItems => {
        let matches = [];
        for (idx in resultItems) {
            if (resultItems[idx] != null) {
                var rows = resultItems[idx].matches.rows.map(row => row.matchId);
                Array.prototype.push.apply(matches, rows);
            }
        }

        const setMatch = new Set(matches);
        const uniqMatch = [...setMatch];
        return insertMatchId(uniqMatch);
    });
}

async function insertMatchId(rows) {
    let result = 0;
    // [START cloud_sql_mysql_mysql_connection]

    rows.forEach(async function(matchId) {
        try {
            //logger.debug(matchId);
            let query = "INSERT INTO matches (matchId, season) VALUES ( '" + matchId + "', '2021U' ); "
            result += await pool.query(query);
        } catch (err) {
            logger.error(err);
        }
    });

    return result;
}


async function getUserInfoCall(userId, gameType, startDate, endDate) {
    var matchInfo = {
        url: "https://api.neople.co.kr/cy/players/#playerId#/matches",
        qs: { apikey: 'G7eAqiszXGrpFFKWpKNxb6xZlmUyr8Rp', gameTypeId: gameType, limit: 100, startDate: startDate, endDate: endDate }
    }

    //logger.debug("요청전의 qs ", matchInfo.qs);

    matchInfo.url = matchInfo.url.replace("#playerId#", userId);

    return await getMatchInfo(matchInfo, null);
}

function isMobile(req) {
    var ua = req.headers['user-agent'].toLowerCase();
    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(ua) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(ua.substr(0, 4))) {
        return true;
    }
    return false;
}

async function getMatchInfo(matchInfo, mergeData) {
    try {
        var result = await new api().call(matchInfo);
        //logger.debug("뭐받음", result);
        var resultJson = JSON.parse(result);
        mergeData = mergeJson(mergeData, resultJson);
        var next = resultJson.matches.next;
        if (next != null) {
            //logger.debug("NEXT가 있어요 ", next);
            matchInfo.qs.next = next;
            await getMatchInfo(matchInfo, mergeData);
        }

        return mergeData;
    } catch (err) {
        return null;
    }
}

function mergeJson(mergeData, resultJson) {
    if (mergeData == null) {
        mergeData = resultJson;
    } else {
        mergeData.matches.rows = mergeData.matches.rows.concat(resultJson.matches.rows);
    }

    return mergeData;
}

function getIp(req, title) {
    const ip = req.headers['x-forwarded-for'] || req.ip;
    logger.debug("아이피: %s", ip);
    return ip;
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