function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최소값은 포함
}

function search(inputId, divName, callback) {
    var names = $("#" + inputId).val().split(" ");
    names.forEach(name => searchUser(inputId, divName, name, callback));
}

function searchVsUser(gameType, myName, partnerName) {
    let my = asyncUserInfo(gameType, myName);
    let partner = asyncUserInfo(gameType, partnerName);

    let widthGameMatchIds = getMatchGames(my, partner);

    return analyzeGame(widthGameMatchIds, my.matches.rows, partner.matches.rows);
}

function analyzeGame(matches, myRow, pRow) {
    var myArr = myRow.filter(row => matches.indexOf(row.matchId) > -1);

    var team = { win: 0, lose: 0, row: [] };
    var enemy = { win: 0, lose: 0, row: [] };

    for (var i in myArr) {
        let myGame = myArr[i];
        let you = pRow.filter(row => row.matchId == myGame.matchId)[0];

        if (myGame.playInfo.result == you.playInfo.result) {
            team[myGame.playInfo.result]++;
            team["row"].push(getMatchGameInfo(myGame, you));
        } else {
            enemy[myGame.playInfo.result]++;
            enemy["row"].push(getMatchGameInfo(myGame, you));
        }
    }

    return { "team": team, "enemy": enemy };
}

function getMatchGameInfo(my, you) {
    return item = {
        "result": my.playInfo.result,
        "my": getPlayInfo(my),
        "you": getPlayInfo(you)
    };
}

function getPlayInfo(info) {
    let playInfo = info.playInfo;

    return {
        "charId": playInfo.characterId,
        "charName": playInfo.characterName,
        "position": info.position.name,
        "kill": playInfo.killCount,
        "death": playInfo.deathCount,
        "assist": playInfo.assistCount,
        "attack": playInfo.attackPoint,
        "damage": playInfo.damagePoint
    }
}

function getMatchGames(my, partner) {
    var myMatches = getMatches(my.matches.rows);
    var pMatches = getMatches(partner.matches.rows);

    return widthGames(myMatches, pMatches);
}

function widthGames(match1, match2) {
    var ret = [];
    for (var i in match1) {
        if (match2.indexOf(match1[i]) > -1) {
            ret.push(match1[i]);
        }
    }
    return ret;
}

function getMatches(rows) {
    return rows.map(row => row.matchId);
}

function searchUser(inputId, divName, nickName, callback) {
    let gameType = $("input[name='gameType']:checked").val();
    if (isDuplicate(gameType, nickName)) {
        var input = $("#" + inputId);
        input.val(input.val().replace(nickName, ''));
        return;
    }

    $.ajax({
        url: "/getUserInfo",
        data: { 'nickname': nickName, 'gameType': gameType },
        success: function(data) {
            if (data.resultCode == -1) {
                alert(nickName + "님의 정보가 없습니다.");
                return;
            }

            $("#" + inputId).val("");
            if (isDuplicate(gameType, nickName)) {
                $("#" + nickName).remove();
            }

            if (typeof callback == 'function') {
                callback(data);
            }
            setUserInfo(gameType, divName, data);
        }
    }).done(function() {

    });
}

function asyncUserInfo(gameType, nickName) {
    var result;
    $.ajax({
        async: false,
        url: "/getUserInfo",
        data: { 'nickname': nickName, 'gameType': gameType },
        success: function(data) {
            if (data.resultCode == -1) {
                alert(nickName + "님의 정보가 없습니다.");
                return;
            }
            result = data;
        }
    }).done(function() {

    });
    return result;
}

function drawPosition(div, rows) {
    var tanker = extractPlayType(rows, "탱커");
    var ad = extractPlayType(rows, "원거리딜러");
    var melee = extractPlayType(rows, "근거리딜러");
    var supp = extractPlayType(rows, "서포터");

    //포지션별 승률
    appendPlayTypeInfo(div, tanker, "tanker"); //탱커
    appendPlayTypeInfo(div, melee, "melee");
    appendPlayTypeInfo(div, ad, "ad");
    appendPlayTypeInfo(div, supp, "supp");
}



function isDuplicate(gameType, nickName) {
    return $("#" + getUserDivId(gameType, nickName)).length != 0;
}

function openDetail(nickname) {
    window.open("/userDetail?nickname=" + nickname, "사용자상세", "fullscreen=yes, toolbar=no, menubar=no, scrollbars=no, resizable=yes");
}

function getUserDivId(gameType, nickname) {
    return nickname + "_" + gameType;
}

function drawRecently(div, rows) {
    var i = Math.min(10, rows.length);
    $(div).find("#recentlyDivTitle").text("최근 " + i + "게임");
    var parent = $(div).find("#recentlyResultDiv");
    for (var j = 0; j < i; j++) {
        parent.append(winLoseKo(rows[j].playInfo.result));
    }
    //여백 만들기용
    parent.append("<span class='child' ></span>");
    parent.append("<span class='child' ></span>");
}

function winLoseKo(result) {
    return (result == "win") ? "<span class='child bold red'>승</span> " : "<span class='child bold blue'>패</span> ";
}

function drawOften(div, info) {
    let count = Math.min(3, info.length);
    $(div).find("#mostCharTitleDiv").text("자주하는캐릭 TOP" + count);
    for (var i = 0; i < count; i++) {
        drawChar(div.find("#mostCharDetailDiv"), info[i]);
    }
}

function drawChar(div, charInfo) {
    div.append(" <img class='drawIcon' src='https://img-api.neople.co.kr/cy/characters/" + charInfo.characterId + "' /> ");
    var pov = (charInfo.win * 100) / charInfo.count;
    div.append(pov.toFixed(0) + "% (" + charInfo.win + "승 " + charInfo.lose + "패)");
}

function drawCharicter(charId) {
    return " <img class='drawIcon' src='https://img-api.neople.co.kr/cy/characters/" + charId + "' />";
}

function appendPlayTypeInfo(div, type, typeId) {
    var infoStr = (type == null) ? "없음" : type.rate.toFixed(0) + "% (" + type.rateInfo + ")";
    $(div).find("#" + typeId + "Span").text(infoStr);
}

function clearDiv(divId) {
    $("#" + divId).empty();
}

function extractPlayType(rows, type) {
    var item = {};
    var result = rows.filter(row => row.position.name == type);
    if (result.length == 0) {
        return null;
    }
    var win = result.filter(row => row.playInfo.result == "win");
    item["rate"] = (win.length * 100 / result.length);
    item["rateInfo"] = win.length + "승 " + (result.length - win.length) + "패";

    return item;
}

function drawCharInfo(div, info, title) {
    let count = Math.min(3, info.length);
    $(div).find("#mostCharTitleDiv").text(title + count + "(5판이상)");
    for (var i = 0; i < count; i++) {
        drawChar(div.find("#mostCharDetailDiv"), info[i]);
    }
}


function extractChar(rows, sort) {
    var result = [];
    var charNames = [];
    rows.forEach(row => {
        var info = row.playInfo;

        if (result[info.characterName] == null) {
            charNames.push(info.characterName);
            result[info.characterName] = {
                'name': info.characterName,
                'characterId': info.characterId,
                'count': 0,
                'win': 0,
                'lose': 0
            };
        }
        result[info.characterName].count++;
        if (info.result == 'win') {
            result[info.characterName].win++;
        } else {
            result[info.characterName].lose++;
        }
    });

    // arr[name]으로 하니 index가 안잡혀서 sort가 안먹어 ㅠㅠ
    var sorted = [];
    charNames.forEach(name => {
        if (result[name].count >= 5) {
            sorted.push(result[name]);
        }
    });
    sorted.sort(sort);
    return sorted;
}

function highScore(a, b) {
    let aRate = (a.win * 100) / (a.win + a.lose);
    let bRate = (b.win * 100) / (b.win + b.lose);
    if (aRate < bRate) {
        return 1;
    }
    if (aRate > bRate) {
        return -1;
    }
    return 0;
}


function sortCase(a, b) {
    if (a.count < b.count) {
        return 1;
    }
    if (a.count > b.count) {
        return -1;
    }
    return 0;
}


// 맵관련 
function extractMap(data, mapId) {
    return data.filter(row => row.map.mapId == mapId);
}