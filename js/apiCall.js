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
    let names = $("#" + inputId).val().split(" ");
    names.forEach(name => searchUser(inputId, divName, name, callback));
}

function searchWait(inputId, divName, callback) {
    let names = $("#" + inputId).val().split(" ");
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
    let myArr = myRow.filter(row => matches.indexOf(row.matchId) > -1);

    let team = { win: 0, lose: 0, row: [] };
    let enemy = { win: 0, lose: 0, row: [] };

    for (let i in myArr) {
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
    let myMatches = getMatches(my.matches.rows);
    let pMatches = getMatches(partner.matches.rows);

    return withGames(myMatches, pMatches);
}

function withGames(match1, match2) {
    let ret = [];
    for (let i in match1) {
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
        let input = $("#" + inputId);
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
    let result;
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
    let tanker = extractPlayType(rows, "탱커");
    let ad = extractPlayType(rows, "원거리딜러");
    let melee = extractPlayType(rows, "근거리딜러");
    let supp = extractPlayType(rows, "서포터");

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

function searchMatch(matchId, callback, prefix = "m") {
    let divId = `${prefix}${matchId}`;
    let div = $(`.${divId}`);
    let divVs = $(`#${divId}Modal`);

    if (div.text().length != 0 || divVs.text().length != 0) {
        if (typeof callback == 'function') {
            callback(matchId, null);
        }
        return;
    }

    let result;
    $.ajax({
        async: false,
        url: "/user/getMatchInfo",
        data: { 'matchId': matchId },
        success: function(data) {
            if (typeof callback == 'function') {
                return callback(matchId, data, divId);
            }
            drawMatch(matchId, data, divId);
        }
    }).done(function() {

    });
    return result;
}

function drawMatch(matchId, result, divId) {
    let prefixMatchId = divId;
    let data;
    //console.log(data);
    if (typeof result == 'string') {
        data = JSON.parse(result);
    } else {
        data = result;
    }
    let div = $("." + prefixMatchId);
    let table = $("#matchInfoTemplate").clone();
    table.attr("id", prefixMatchId + "div");
    let tbody = table.find("tbody");

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
    let resultTeam = players.filter(player => findTeam.includes(player.playerId));
    resultTeam.forEach(item => item.playInfo.result = result);

    return resultTeam;
}

function drawInGameList(data) {
    let matchId = data.matchId;
    let playInfo = data.playInfo;
    let score =
        `<tr>
             <td>${isMobile ? data.date.substr(5) : data.date}</td>
             <td>${getPartyInfoText(playInfo.partyInfo)}</td>
             <td>${winLoseKo(playInfo.result)}</td>
             <td>${getPositionIcon(data.position.name)}</td>
             <td>${drawCharicter(playInfo.characterId)}</td>`;
    if (isMobile) {
        score +=
            `<td class='kda'>${playInfo.killCount}/${playInfo.deathCount}/${playInfo.assistCount}</td>
             <td>
                <i class='fas fa-angle-double-down' data-toggle='collapse' 
                    data-target='.m${matchId}' onClick='searchMatch("${matchId}")' >
             </td>
        </tr>`;
    } else {
        score +=
            `<td>${playInfo.level}</td>
             <td class='kda'>${playInfo.killCount}/${playInfo.deathCount}/${playInfo.assistCount}</td>"
             <td class='kda'>${(playInfo.attackPoint / 1000).toFixed(0)}K</td>
             <td class='kda'>${(playInfo.damagePoint / 1000).toFixed(0)}K</td>
             <td class='kda'>${((playInfo.spendConsumablesCoin / playInfo.getCoin) * 100).toFixed(0)}%</td>
             <td>
                <i class='fas fa-angle-double-down' data-toggle='collapse' 
                    data-target='.m${matchId}' onClick='searchMatch("${matchId}")' >
             </td>
        </tr>`;
    }
    score +=
        `<tr>
            <td class='hiddenRow' colspan='${isMobile ? 7 : 12}'>
                <div class='collapse m${matchId}'></div>
            </td>
        </tr>`;

    return score;
}

function drawInGameDetail(matchId, data, trClass) {
    let playInfo = data.playInfo;
    let partyCnt = playInfo.partyUserCount == 0 ? "(솔플)" : `(${playInfo.partyUserCount}인)`;

    let score = `<tr class='${trClass}'>`;
    if (isMobile) {
        score +=
            `<td>${winLoseKo(playInfo.result)}</td>
             <td> ${drawCharicter(playInfo.characterId, true)} </td>
             <td colspan='3'>
                <div class='fontSmall'>
                    &nbsp;${getPositionIcon(data.position.name)}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    ${getBuffIcon(data.position.attribute, buffDefaultUrl)}<br> 
                    <a href='#' onClick='javascript:partyUserSearch(this, true);' >${data.nickname}</a>
                    ${partyCnt}
                </div>
             </td>
             <td class='kda'>
                ${playInfo.killCount}/${playInfo.deathCount}/${playInfo.assistCount}
                <br>${(playInfo.attackPoint / 1000).toFixed(0)}K/${(playInfo.damagePoint / 1000).toFixed(0)}K
             </td>`;
    } else {
        let useCoin = playInfo.spendConsumablesCoin.toLocaleString();
        let usePer = ((playInfo.spendConsumablesCoin / playInfo.getCoin) * 100).toFixed(0);

        score += `<td>${winLoseKo(playInfo.result)}</td>";
                  <td>${drawCharicter(playInfo.characterId)}</td>";
                  <td>${getPositionIcon(data.position.name)}</td>";
                  <td>${getBuffIcon(data.position.attribute, buffDefaultUrl)}</td>`;
        if (typeof partyUserSearch == 'function' && pageName != 'pcDetail') {
            score +=
                ` <td>
                     <a href='#' onClick='javascript:partyUserSearch(this);'>${data.nickname}</a>
                     &nbsp;${partyCnt}
                  </td>`;
        } else {
            score += `<td>${data.nickname} ${partyCnt}</td>`;
        }
        score +=
            `<td>${playInfo.level}</td>
             <td class='kda'>${(playInfo.killCount + playInfo.deathCount / playInfo.assistCount).toFixed(0)}</td>
             <td class='kda'>${playInfo.killCount}</td>
             <td class='kda'>${playInfo.deathCount}</td>
             <td class='kda'>${playInfo.assistCount}</td>
             <td class='kda'>${(playInfo.attackPoint / 1000).toFixed(0)}K</td>
             <td class='kda'>${(playInfo.damagePoint / 1000).toFixed(0)}K</td>
             <td class='kda'>${playInfo.getCoin.toLocaleString()}</td>
             <td class='kda'>${useCoin}(${usePer}%)</td>`;
    }

    let itemInfoId = `m${matchId}_${data.playerId}`;
    if (!isMobile) {
        score += `<td>
                    <i class="fas fa-angle-double-down" data-toggle="collapse" 
                        data-target=".${itemInfoId}" aria-expanded="true">
                    </i>
                </td>`;
    }
    score += "</tr>"

    //아이템 착용
    if (!isMobile) {
        `<tr class='" + trClass + "'>
            <td class='hiddenRow' colspan='${isMobile ? 7 : 15}'>
                <div class='collapse ${itemInfoId}'>${getItemIcon(data.items, itemDefaultUrl)}</div>
            </td>
        </tr>`;
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
    let headCount = Math.min(10, rows.length);
    let bodyCount = Math.min(20, rows.length);

    let title = $(div).find("#recentlyDivTitle");
    if (!isMobile) {
        title.prepend("최근 게임:");
    }

    let body = $("#templateModal").clone();
    body.attr("id", userDivId + "Modal");
    body.attr("aria-labelledby", userDivId + "ModalLabel");
    body.find("#templateModalLabel")
        .attr("id", userDivId + "ModalLabel")
        .empty()
        .append("최근 " + bodyCount + "게임");

    rows.sort(sortDate);
    let titleText = "";
    for (let j = 0; j < bodyCount; j++) {
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

function drawOften(div, info, drawCharFunc, nickname) {
    let count = Math.min(isMobile ? 6 : 8, info.length);
    let rowCount = isMobile ? 6 : 8;

    $(div).find("#mostCharTitleDiv").text("자주하는캐릭 TOP" + count);
    for (let i = 0; i < count; i++) {
        if (typeof drawCharFunc == 'function') {
            drawCharFunc(div.find("#mostCharDetailDiv"), info[i], nickname);
        } else {
            drawChar(div.find("#mostCharDetailDiv"), info[i], nickname);
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
    let height = (pageName == "pcUserSearch_vertical") ? 102 : 45;
    if (isMobile) {
        height = 51;
    }
    let card = $(div).find("#cardTemp").clone();
    card.attr("style", `height:${height}px;`);

    card.removeAttr("id");
    card.removeAttr("hidden");
    card.empty();
    div.append(card);
}

function drawChar(div, charInfo) {
    div.append(` <img class='drawIcon' src='https://img-api.neople.co.kr/cy/characters/${charInfo.characterId}' /> `);
    let pov = ((charInfo.win * 100) / charInfo.count) || 0;
    div.append(`${pov.toFixed(0)}% (${charInfo.win}승 ${charInfo.lose}패)`);
}

function drawCharicter(charId, isLarge = false) {
    return ` <img class='drawIcon ${isLarge ? 'charImgLarge' : ''}' src='https://img-api.neople.co.kr/cy/characters/${charId}' />`;
}

function appendPlayTypeInfo(div, type, typeId) {
    let infoStr = "0% <br><small class='text-muted'> 0승 0패</small>";
    if (type != null) {
        infoStr = `${type.rate.toFixed(0)}% <br><small class='text-muted'>${type.rateInfo}</small>`;
    }
    $(div).find("#" + typeId + "Span").empty().append(infoStr);
}

function clearDiv(divId) {
    $("#" + divId).empty();
}

function extractPlayType(rows, type) {
    let item = {};
    let result = rows.filter(row => row.position.name == type && row.playInfo.playTypeName == "정상");
    if (result.length == 0) {
        return null;
    }
    let win = result.filter(row => row.playInfo.result == "win");
    item["rate"] = (win.length * 100 / result.length);
    item["rateInfo"] = win.length + "승 " + (result.length - win.length) + "패";

    return item;
}

function drawCharInfo(div, info, title) {
    let gt = 1;
    let count = Math.min(gt, info.length);
    $(div).find("#mostCharTitleDiv").text(title + count + "(" + gt + "판 이상)");
    for (let i = 0; i < count; i++) {
        drawChar(div.find("#mostCharDetailDiv"), info[i]);
    }
}

function extractChar(rows, sort) {
    let result = [];
    let charNames = [];
    rows.forEach(row => {
        let info = row.playInfo;

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
    let sorted = [];
    let charGtCnt = 2;
    charNames.forEach(name => {
        if (result[name].count >= charGtCnt) {
            sorted.push(result[name]);
        }
    });
    sorted.sort(sort);
    return sorted;
}

//파티 관련 
//파티별 승률 (솔로/파티)
function drawPartyType(userDivId, clone, row) {
    let partyJson = extractParty(row);

    let soloAllCnt = partyJson.solo.win + partyJson.solo.lose;
    let partyAllCnt = partyJson.all.win + partyJson.all.lose;
    let appendHtml = "";

    appendHtml += `솔플: ${soloAllCnt}전 ${partyJson.solo.win}승 ${partyJson.solo.lose}패, 
                   파티: ${partyAllCnt}전 ${partyJson.all.win}승 ${partyJson.all.lose}패 <br>`;

    let moreIcon = '<i class="fa fa-search-plus" style="font-size:15px;color:black;"></i>';
    if (partyJson.two.all != 0) {
        appendHtml +=
            `2인: ${partyJson.two.win}승 ${partyJson.two.lose}패 
            <a data-toggle='collapse' href='#two${userDivId}' role='button' 
                aria-expanded='false' aria-controls='two${userDivId}' >${moreIcon}</a>  `;
    }
    if (partyJson.three.all != 0) {
        appendHtml +=
            `3인: ${partyJson.three.win}승 ${partyJson.three.lose}패 
            <a data-toggle='collapse' href='#three${userDivId}' role='button' 
                aria-expanded='false' aria-controls='three${userDivId}' >${moreIcon}</a>  `;
    }
    if (partyJson.five.all != 0) {
        appendHtml +=
            `5인: ${partyJson.five.win}승 ${partyJson.five.lose}패 
            <a data-toggle='collapse' href='#five${userDivId}' role='button' 
	            aria-expanded='false' aria-controls='five${userDivId}' >${moreIcon}</a>  `;
    }
    appendHtml += "<br><div class='row'>";

    if (partyJson.two.all != 0) {
        let partyResult = getEachPartyResult(partyJson.two.party);
        appendHtml += `<div class='collapse multi-collapse' id='two${userDivId}'>${partyResult}</div>`;
    }
    if (partyJson.three.all != 0) {
        let partyResult = getEachPartyResult(partyJson.three.party);
        appendHtml += `<div class='collapse multi-collapse' id='three${userDivId}'>${partyResult}</div>`;
    }
    if (partyJson.five.all != 0) {
        let partyResult = getEachPartyResult(partyJson.five.party);
        appendHtml += `<div class='collapse multi-collapse' id='five${userDivId}'>${partyResult}</div>`;
    }
    appendHtml += "</div>";
    clone.append(appendHtml);
}

function getEachPartyResult(arr) {
    let resultTable =
        `<table class='table'> 
            <thead class='thead-dark'>
            <tr>
                <th scope='col'>파티원</th>
                <th scope='col'>겜수</th>
                <th scope='col'>승</th>
                <th scope='col'>패</th>
                <th scope='col'>승률</th>
            </tr>
            </thead>
            <tbody>`;

    for (idx in arr) {
        let row = arr[idx];
        let total = row.win + row.lose;
        let rate = ((row.win * 100) / total).toFixed(0) + "%";

        resultTable += `<tr>`;
        if (pageName != 'pcDetail') {
            resultTable += `<th scope='row'> <a href='#' onClick='partyUserSearch(this);' />${row.name}</a></th>`;
        } else {
            resultTable += `<th scope='row'>${row.name}</th>`;
        }
        resultTable += `<td>${total}</td>
                        <td>${row.win}</td>
                        <td>${row.lose}</td>
                        <td>${rate}</td>
                    </tr>`
    }
    resultTable += "</tbody></table>";
    return resultTable;
}

function partyUserSearch(aTagObj, isMobile = false) {
    let aTag = $(aTagObj);
    let partyUserNames = aTag.text().replace(",", " ");
    let conId = aTag.closest(".infoLayer").attr("id");
    conId = conId == null ? "con2_2" : conId;

    let inputId = (conId == "con1_2") ? 'nickNames' : 'nickNames2';
    if (isMobile) {
        inputId = "nickNames";
        conId = "con1_2";
    }

    $("#" + inputId).val(partyUserNames);
    search(inputId, conId);
}

function addPlayResult(subPartyResult, matchId, data, isParty) {
    subPartyResult[data.result]++;
    subPartyResult["count"]++;

    if (isParty) {
        let partyId = data.partyInfo.map(row => row.playerId).sort().join(",");
        let partyName = data.partyInfo.map(row => row.nickname).sort().join(",");

        if (subPartyResult.party[partyId] == null) {
            subPartyResult.party[partyId] = {
                matchId: [],
                name: "",
                count: 0,
                win: 0,
                lose: 0
            };
        }
        subPartyResult.party[partyId].count++;
        subPartyResult.party[partyId][data.result]++;
        subPartyResult.party[partyId].name = partyName;
        subPartyResult.party[partyId].matchId.push(matchId);
    }
}

function extractParty(rows) {
    let partyResult = {
        solo: {
            win: 0,
            lose: 0
        },
        all: {
            count: 0,
            win: 0,
            lose: 0
        },
        two: {
            count: 0,
            win: 0,
            lose: 0,
            party: {}
        },
        three: {
            count: 0,
            win: 0,
            lose: 0,
            party: {}
        },
        five: {
            count: 0,
            win: 0,
            lose: 0,
            party: {}
        },
    };

    let solo = rows.filter(row => row.playInfo.partyInfo.length == 0);
    partyResult.solo.win = solo.filter(row => row.playInfo.result == 'win').length;
    partyResult.solo.lose = solo.filter(row => row.playInfo.result == 'lose' && row.playInfo.playTypeName == '정상').length;

    let party = rows.filter(row => row.playInfo.partyInfo.length != 0);
    for (let i in party) {
        let matchId = party[i].matchId;
        let playInfo = party[i].playInfo;
        let cnt = playInfo.partyUserCount;

        addPlayResult(partyResult.all, matchId, playInfo, false);
        if (cnt == 2) {
            addPlayResult(partyResult.two, matchId, playInfo, true);
        } else if (cnt == 3) {
            addPlayResult(partyResult.three, matchId, playInfo, true);
        } else if (cnt == 5) {
            addPlayResult(partyResult.five, matchId, playInfo, true);
        }
    }

    partyResult.two.party = partySort(partyResult.two.party, sortCase);
    partyResult.three.party = partySort(partyResult.three.party, sortCase);
    partyResult.five.party = partySort(partyResult.five.party, sortCase);

    return partyResult;
}

function partySort(party, sort) {
    let keys = Object.keys(party);
    let sorted = [];
    keys.forEach(key => {
        sorted.push(party[key]);
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

function totalDesc(a, b) {
    if (a.total < b.total) {
        return 1;
    }
    if (a.total > b.total) {
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

function rateDesc(a, b) {
    if (a.rate < b.rate) {
        return 1;
    }
    if (a.rate > b.rate) {
        return -1;
    }
    return 0;
}

function rateAsc(a, b) {
    if (a.rate > b.rate) {
        return 1;
    }
    if (a.rate < b.rate) {
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