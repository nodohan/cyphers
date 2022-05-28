var tankerIcon = "<img class='drawIcon' src='http://static.cyphers.co.kr/img/game_position/position1.jpg'>";
var meleeIcon = "<img class='drawIcon' src='http://static.cyphers.co.kr/img/game_position/position2.jpg'>";
var adIcon = "<img class='drawIcon' src='http://static.cyphers.co.kr/img/game_position/position3.jpg'>";
var suppIcon = "<img class='drawIcon' src='http://static.cyphers.co.kr/img/game_position/position4.jpg'>";
var buffDefaultUrl = "https://img-api.neople.co.kr/cy/position-attributes/";
var itemDefaultUrl = "https://img-api.neople.co.kr/cy/items/";

var pageName = "";

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최소값은 포함
}

function search(inputId, divName, callback) {
    var names = $("#" + inputId).val().split(" ");
    names.forEach(name => searchUser(inputId, divName, name, callback));
}

function searchWait(inputId, divName, callback) {
    var names = $("#" + inputId).val().split(" ");

    for (idx in names) {
        let userName = names[idx];
        let time = idx * 50;
        setTimeout(() => searchUser(inputId, divName, userName, callback), time);
    }
}

function searchVsUser(gameType, myName, partnerName) {
    let my = asyncUserInfo(gameType, myName);
    let partner = asyncUserInfo(gameType, partnerName);

    let withGameMatchIds = getMatchGames(my, partner);

    return analyzeGame(withGameMatchIds, my.matches.rows, partner.matches.rows);
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
        "date": my.date,
        "matchId": my.matchId,
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

    return withGames(myMatches, pMatches);
}

function withGames(match1, match2) {
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
    if (nickName == "") {
        alert("검색어를 입력해 주세요");
        return;
    }

    let gameType = $("input[name='gameType']:checked").val();
    if (isDuplicate(gameType, nickName)) {
        var input = $("#" + inputId);
        input.val(input.val().replace(nickName, ''));
        return;
    }

    $.ajax({
        url: "/user/getUserInfo",
        data: {
            'nickname': nickName,
            'gameType': gameType,
            'device': (isMobile ? 'mobile' : 'pc'),
            'page': pageName
        },
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
                return;
            }
            setUserInfo(gameType, divName, data);
        },
        error: function(data) {
            alert(nickName + "님의 정보가 없습니다.");
            return;
        }
    }).done(function() {

    });
}

function asyncUserInfo(gameType, nickName) {
    var result;
    $.ajax({
        async: false,
        url: "/user/getUserInfo",
        data: { 'nickname': nickName, 'gameType': gameType },
        success: function(data) {
            if (data.resultCode == -1) {
                alert(nickName + "님의 정보가 없습니다.");
                return;
            }
            result = data;
        },
        error: function(data) {
            alert(nickName + "님의 정보가 없습니다.");
            return;
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
    window.open("/user/userDetail?nickname=" + nickname, "사용자상세", "fullscreen=yes, toolbar=no, menubar=no, scrollbars=no, resizable=yes");
}

function getUserDivId(gameType, nickname) {
    return nickname + "_" + gameType;
}

function searchMatch(matchId, callback) {
    var div = $(".m" + matchId);
    var divVs = $("#m" + matchId + "Modal");

    if (div.text().length != 0 || divVs.text().length != 0) {
        if (typeof callback == 'function') {
            callback(matchId, null);
        }
        return;
    }

    var result;
    $.ajax({
        async: false,
        url: "/user/getMatchInfo",
        data: { 'matchId': matchId },
        success: function(data) {
            if (typeof callback == 'function') {
                callback(matchId, data);
            }
            drawMatch(matchId, data);
        }
    }).done(function() {

    });
    return result;
}

function drawMatch(matchId, result) {
    let prefixMatchId = "m" + matchId;
    var data;
    //console.log(data);
    if (typeof result == 'string') {
        data = JSON.parse(result);
    } else {
        data = result;
    }
    var div = $("." + prefixMatchId);
    let table = $("#matchInfoTemplate").clone();
    table.attr("id", prefixMatchId + "div");
    var tbody = table.find("tbody");

    let winTeam = getTeam(data.teams, "win", data.players);
    let loseTeam = getTeam(data.teams, "lose", data.players);

    for (idx in winTeam) {
        tbody.append(drawInGameDetail(matchId, winTeam[idx], "table-primary"));
    }
    //tbody.append("")
    for (idx in loseTeam) {
        tbody.append(drawInGameDetail(matchId, loseTeam[idx], "table-danger"));
    }

    div.append(table);
}

function getTeam(team, result, players) {
    let findTeam = team[0].result == result ? team[0].players : team[1].players;
    var resultTeam = players.filter(player => findTeam.includes(player.playerId));
    resultTeam.forEach(item => item.playInfo.result = result);

    return resultTeam;
}

function drawInGameList(data) {
    let matchId = data.matchId;
    let playInfo = data.playInfo;
    let score = "";

    if (isMobile) {
        score = "<tr>";
        score += "<td>" + data.date.substr(5) + "</td>";
        score += "<td>" + getPartyInfoText(playInfo.partyInfo) + "</td>";
        score += "<td>" + winLoseKo(playInfo.result) + "</td>";
        score += "<td>" + getPositionIcon(data.position.name) + "</td>";
        score += "<td>" + drawCharicter(playInfo.characterId) + "</td>";
        score += "<td class='kda'>" + playInfo.killCount + "/" + playInfo.deathCount + "/" + playInfo.assistCount + "</td>"
        score += "<td><i class='fas fa-angle-double-down' data-toggle='collapse' data-target='.m" + matchId + "' onClick='searchMatch(\"" + matchId + "\")' ></td>";
        score += "</tr>"
        score += "<tr>";
        score += "<td class='hiddenRow' colspan='7'>";
        score += "<div class='collapse m" + matchId + "'></div>";
        score += "</td>";
        score += "</tr>";
    } else {
        score = "<tr>";
        score += "<td>" + data.date + "</td>";
        score += "<td>" + getPartyInfoText(playInfo.partyInfo) + "</td>";
        score += "<td>" + winLoseKo(playInfo.result) + "</td>";
        score += "<td>" + getPositionIcon(data.position.name) + "</td>";
        score += "<td>" + drawCharicter(playInfo.characterId) + "</td>";
        score += "<td>" + playInfo.level + "</td>";
        score += "<td class='kda'>" + playInfo.killCount + "/" + playInfo.deathCount + "/" + playInfo.assistCount + "</td>"
        score += "<td class='kda'>" + (playInfo.attackPoint / 1000).toFixed(0) + "K</td>";
        score += "<td class='kda'>" + (playInfo.damagePoint / 1000).toFixed(0) + "K</td>";
        score += "<td class='kda'>" + ((playInfo.spendConsumablesCoin / playInfo.getCoin) * 100).toFixed(0) + "%</td>";
        score += "<td><i class='fas fa-angle-double-down' data-toggle='collapse' data-target='.m" + matchId + "' onClick='searchMatch(\"" + matchId + "\")' ></td>";
        score += "</tr>"
        score += "<tr>";
        score += "<td class='hiddenRow' colspan='12'>";
        score += "<div class='collapse m" + matchId + "'></div>";
        score += "</td>";
        score += "</tr>";
    }

    return score;
}


function drawInGameDetail(matchId, data, trClass) {
    let playInfo = data.playInfo;
    let partyCnt = playInfo.partyUserCount == 0 ? "(솔플)" : `(${playInfo.partyUserCount}인)`;

    let score = "<tr class='" + trClass + "'>";
    if (isMobile) {
        score += "<td>" + winLoseKo(playInfo.result) + "</td>";
        score += `<td> ${drawCharicter(playInfo.characterId, true)} </td> `;
        score += `<td colspan='3'><div class='fontSmall'>&nbsp;${getPositionIcon(data.position.name)}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`;
        score += `${getBuffIcon(data.position.attribute, buffDefaultUrl)}<br> ${data.nickname} ${partyCnt} </div> </td>`;
        score += `<td class='kda'>${playInfo.killCount}/${playInfo.deathCount}/${playInfo.assistCount}<br>${(playInfo.attackPoint / 1000).toFixed(0)}K/${(playInfo.damagePoint / 1000).toFixed(0)}K`;
        score += `</td>`;
    } else {
        score += "<td>" + winLoseKo(playInfo.result) + "</td>";
        score += "<td>" + drawCharicter(playInfo.characterId) + "</td>";
        score += "<td>" + getPositionIcon(data.position.name) + "</td>";
        score += "<td>" + getBuffIcon(data.position.attribute, buffDefaultUrl) + "</td>";

        if (typeof partyUserSearch == 'function') {
            score += `<td><a href='#' onClick='javascript:partyUserSearch(this);' >${data.nickname}</a>&nbsp;${partyCnt}</td>`;
        } else {
            score += `<td>${data.nickname} ${partyCnt}</td>`;
        }
        score += "<td>" + playInfo.level + "</td>";
        score += "<td class='kda'>" + (playInfo.killCount + playInfo.deathCount / playInfo.assistCount).toFixed(0) + "</td>"
        score += "<td class='kda'>" + playInfo.killCount + "</td>";
        score += "<td class='kda'>" + playInfo.deathCount + "</td>";
        score += "<td class='kda'>" + playInfo.assistCount + "</td>";
        score += "<td class='kda'>" + (playInfo.attackPoint / 1000).toFixed(0) + "K</td>";
        score += "<td class='kda'>" + (playInfo.damagePoint / 1000).toFixed(0) + "K</td>";
        score += "<td class='kda'>" + playInfo.getCoin.toLocaleString() + "</td>"; //먹은코인
        let useCoin = playInfo.spendConsumablesCoin.toLocaleString();
        let usePer = ((playInfo.spendConsumablesCoin / playInfo.getCoin) * 100).toFixed(0);
        score += `<td class='kda'>${useCoin}(${usePer}%)</td>`; //소모품코인
    }

    let itemInfoId = `m${matchId}_${data.playerId}`;
    if (!isMobile) {
        score += `<td><i class="fas fa-angle-double-down" data-toggle="collapse" data-target=".${itemInfoId}" aria-expanded="true"></i></td>`;
    }
    score += "</tr>"

    //아이템 착용
    if (!isMobile) {
        score += "<tr class='" + trClass + "'>";
        score += `<td class='hiddenRow' colspan='${isMobile ? 7 : 15}'>`;
        score += `<div class='collapse ${itemInfoId}'>${getItemIcon(data.items, itemDefaultUrl)}</div>`;
        score += "</td>";
        score += "</tr>";
    }

    return score;
}

function getBuffIcon(buffArr, url) {
    return buffArr
        .map(row => `<img class='drawIcon' title='${row.name}' src='${url+row.id}' />`)
        .join("&nbsp;");
}

function getItemIcon(buffArr, url) {
    return buffArr
        .map(row => `<img class='${isMobile ? 'drawIcon' : ''}' title='${row.itemName}' src='${url+row.itemId}' />`)
        .join("&nbsp;");
}

function getPartyInfoText(partyInfo) {
    let icon = isMobile ? "" : `<i class="fa fa-info-circle"></i>`;
    let partySize = partyInfo.length;
    if (partySize == 0) {
        return "솔로";
    }
    let names = partyInfo.map(row => row.nickname).join(",");
    if (partySize == 1) {
        return `<span title="${names}"> 듀오${icon}</span>`;
    } else if (partySize >= 2) {
        return `<span title="${names}"> ${partySize+1}인${icon}</span>`;
    }
}

function getPositionIcon(type) {
    let icon = "";
    switch (type) {
        case "탱커":
            icon = tankerIcon;
            break;
        case "근거리딜러":
            icon = meleeIcon;
            break;
        case "원거리딜러":
            icon = adIcon;
            break;
        case "서포터":
            icon = suppIcon;
            break;
    }
    return icon;
}

function drawRecently(div, rows, userDivId) {
    var headCount = Math.min(10, rows.length);
    var bodyCount = Math.min(20, rows.length);

    var title = $(div).find("#recentlyDivTitle");
    if (!isMobile) {
        title.prepend("최근 게임:");
    }

    var body = $("#templateModal").clone();
    body.attr("id", userDivId + "Modal");
    body.attr("aria-labelledby", userDivId + "ModalLabel");
    body.find("#templateModalLabel").attr("id", userDivId + "ModalLabel").empty().append("최근 " + bodyCount + "게임");

    rows.sort(sortDate);
    var titleText = "";
    for (var j = 0; j < bodyCount; j++) {
        if (j < headCount) {
            titleText += winLoseKo(rows[j].playInfo.result);
        }
        body.find("tbody").append(drawInGameList(rows[j]));
    }
    let moreIcon = '<i class="fa fa-search-plus" style="font-size:15px;color:black"></i>';

    title.append(titleText);
    title.append(`<a data-toggle='modal' data-target='#${userDivId}Modal'>&nbsp;${moreIcon}</a>`);

    $("#modalDiv").append(body);
}

function winLoseKo(result) {
    return (result == "win") ? "<span class='red'>승</span> " : "<span class='blue'>패</span> ";
}

function drawOften(div, info, drawCharFunc) {
    let count = Math.min(isMobile ? 6 : 8, info.length);
    let rowCount = isMobile ? 6 : 8;

    $(div).find("#mostCharTitleDiv").text("자주하는캐릭 TOP" + count);
    for (var i = 0; i < count; i++) {
        if (typeof drawCharFunc == 'function') {
            drawCharFunc(div.find("#mostCharDetailDiv"), info[i]);
        } else {
            drawChar(div.find("#mostCharDetailDiv"), info[i]);
        }
    }

    let emptyDivCount = rowCount - count;
    if (emptyDivCount > 0) {
        for (i = 0; i < emptyDivCount; i++) {
            drawEmptyChar(div.find("#mostCharDetailDiv"));
        }
    }
}

function drawEmptyChar(div) {
    let height = (pageName == "pcUserSearch") ? 45 : 102;
    if (isMobile) {
        height = 51;
    }
    var card = $(div).find("#cardTemp").clone();
    card.attr("style", `height:${height}px;`);

    card.removeAttr("id");
    card.removeAttr("hidden");
    card.empty();
    div.append(card);
}

function drawChar(div, charInfo) {
    div.append(" <img class='drawIcon' src='https://img-api.neople.co.kr/cy/characters/" + charInfo.characterId + "' /> ");
    var pov = (charInfo.win * 100) / charInfo.count;
    div.append(pov.toFixed(0) + "% (" + charInfo.win + "승 " + charInfo.lose + "패)");
}

function drawCharicter(charId, isLarge = false) {
    return ` <img class='drawIcon ${isLarge ? 'charImgLarge' : ''}' src='https://img-api.neople.co.kr/cy/characters/${charId}' />`;
}

function appendPlayTypeInfo(div, type, typeId) {
    var infoStr = (type == null) ? "0% <br><small class='text-muted'> 0승 0패</small>" : type.rate.toFixed(0) + "% <br><small class='text-muted'>" + type.rateInfo + "</small>";
    //57% <br> <small class="text-muted">79승 60패 </small>
    $(div).find("#" + typeId + "Span").empty().append(infoStr);
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
    let gt = 1;
    let count = Math.min(gt, info.length);
    $(div).find("#mostCharTitleDiv").text(title + count + "(" + gt + "판 이상)");
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
    let charGtCnt = 2;
    charNames.forEach(name => {
        if (result[name].count >= charGtCnt) {
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

function lateDesc(a, b) {
    if (a.late < b.late) {
        return 1;
    }
    if (a.late > b.late) {
        return -1;
    }
    return 0;
}

function lateAsc(a, b) {
    if (a.late > b.late) {
        return 1;
    }
    if (a.late < b.late) {
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


function sortDate(a, b) {
    if (a.date < b.date) {
        return 1;
    }
    if (a.date > b.date) {
        return -1;
    }
    return 0;
}

// 맵관련 
function extractMap(data, mapId) {
    return data.filter(row => row.map.mapId == mapId);
}

function historyNickname(playerId, callback) {
    $.ajax({
        async: false,
        url: "/user/getNicknameHistory",
        data: { 'playerId': playerId },
        success: function(data) {
            callback(data);
        }
    }).done(function() {

    });
}

function userSeasonRank(playerId, callback) {
    $.ajax({
        async: false,
        url: "/user/getUserSeasonRank",
        data: { 'playerId': playerId },
        success: function(data) {
            callback(data);
        }
    }).done(function() {

    });

}