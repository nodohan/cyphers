const tankerIcon = "<img class='drawIcon' src='http://static.cyphers.co.kr/img/game_position/position1.jpg'>";
const meleeIcon = "<img class='drawIcon' src='http://static.cyphers.co.kr/img/game_position/position2.jpg'>";
const adIcon = "<img class='drawIcon' src='http://static.cyphers.co.kr/img/game_position/position3.jpg'>";
const suppIcon = "<img class='drawIcon' src='http://static.cyphers.co.kr/img/game_position/position4.jpg'>";
const buffDefaultUrl = "https://img-api.neople.co.kr/cy/position-attributes/";
const itemDefaultUrl = "https://img-api.neople.co.kr/cy/items/";

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
            addSearchHistory(nickName);

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

function drawPosition(div, rows, nickname, drawFuncCall) {
    let tanker = extractPlayType(rows, "탱커");
    let ad = extractPlayType(rows, "원거리딜러");
    let melee = extractPlayType(rows, "근거리딜러");
    let supp = extractPlayType(rows, "서포터");

    //포지션별 승률
    const positionDiv = $(div).find("#positionDiv");
    positionDiv.empty();

    // const drawFunc = typeof drawCharFunc == 'function' ? drawFuncCall : appendPlayTypeInfo;
    const drawFunc = drawFuncCall;
    drawFunc(positionDiv, tanker, "tanker", "탱커", nickname); //탱커
    drawFunc(positionDiv, melee, "melee", "근거리딜러", nickname);
    drawFunc(positionDiv, ad, "ad", "원거리딜러", nickname);
    drawFunc(positionDiv, supp, "supp", "서포터", nickname);
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
             <td>${data.date}</td>
             <td>${getPartyInfoText(playInfo.partyInfo)}</td>
             <td>${winLoseKo(playInfo.result)}</td>
             <td>${getPositionIcon(data.position.name)}</td>
             <td>${drawCharicter(playInfo.characterId)}</td>
             <td>${playInfo.level}</td>
             <td class='kda'>${playInfo.killCount}/${playInfo.deathCount}/${playInfo.assistCount}</td>"
             <td class='kda'>${(playInfo.attackPoint / 1000).toFixed(0)}K</td>
             <td class='kda'>${(playInfo.damagePoint / 1000).toFixed(0)}K</td>
             <td class='kda'>${((playInfo.spendConsumablesCoin / playInfo.getCoin) * 100).toFixed(0)}%</td>
             <td>
                <i class='fas fa-angle-double-down' data-toggle='collapse' 
                    data-target='.m${matchId}' onClick='searchMatch("${matchId}")' >
             </td>
        </tr>
        <tr>
            <td class='hiddenRow' colspan='15'>
                <div class='collapse m${matchId}'></div>
            </td>
        </tr>`;

    return score;
}

function drawInGameDetail(matchId, data, trClass) {
    const { playInfo, items }  = data;
    let partyCnt = playInfo.partyUserCount == 0 ? "(솔플)" : `(${playInfo.partyUserCount}인)`;

    let score = `<tr class='${trClass}'>`;
    let useCoin = playInfo.spendConsumablesCoin.toLocaleString();
    let usePer = ((playInfo.spendConsumablesCoin / playInfo.getCoin) * 100).toFixed(0);
    const isSecond = items.some(item => item.itemName.endsWith("SU"));
    const secondIcon = "<img class='secondChar' src='/image/ee.png' />";

    score += `<td>${winLoseKo(playInfo.result)}</td>";
                <td>${isSecond? secondIcon : ""}</td>
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

    const gradeTrId = `d_${matchId}_${data.playerId}_grade`;
    const rpTrId = `d_${matchId}_${data.playerId}_rp`;
    score += `
         <td class='${gradeTrId}'>0급</td>
         <td class='${rpTrId}'>0</td>
         <td>${playInfo.level}</td>
         <!-- <td class='kda'>${(playInfo.killCount + playInfo.deathCount / playInfo.assistCount).toFixed(0)}</td> -->
         <td class='kda'>${playInfo.killCount}</td>
         <td class='kda'>${playInfo.deathCount}</td>
         <td class='kda'>${playInfo.assistCount}</td>
         <td class='kda'>${(playInfo.attackPoint / 1000).toFixed(0)}K</td>
         <td class='kda'>${(playInfo.damagePoint / 1000).toFixed(0)}K</td>
         <td class='kda'>${(playInfo.healAmount / 1000).toFixed(0)}K</td>
         <td class='kda'>${playInfo.demolisherKillCount}</td>
         <td class='kda'>${playInfo.sentinelKillCount}</td>
         <td class='kda'>${playInfo.getCoin.toLocaleString()}</td>
         <td class='kda'>${useCoin}(${usePer}%)</td>`;

    getUserGradeRp(gradeTrId, rpTrId, data.playerId);

    let itemInfoId = `m${matchId}_${data.playerId}`;
    score += `<td>
                <i class="fas fa-angle-double-down" data-toggle="collapse" 
                    data-target=".${itemInfoId}" aria-expanded="true">
                </i>
            </td>
        </tr>
        <tr class='${trClass}'>
            <td class='hiddenRow' colspan='${isMobile ? 7 : 15}'>
                <div class='collapse ${itemInfoId}'>${getItemIcon(data.items, itemDefaultUrl)}</div>
            </td>
        </tr>`;

    return score;
}

const getUserGradeRp = (gradeTrId, rpTrId, nickname) => { 
    $.ajax({
        async: true,
        url: "/user/userInfoSimple",
        data: { 'playerId': nickname },
        success: function(data) {
            if(data.resultCode == 200) {
                drawUserGradeRp(gradeTrId, rpTrId, data);
            }
        }
    }).done(function() {

    });
}

const drawUserGradeRp = (gradeTrId, rpTrId, data) =>  {    
    const { grade, ratingPoint, maxRatingPoint } = data.row;

    $("."+ gradeTrId).empty().append(grade+"급");
    $("."+ rpTrId).empty().append(`${ratingPoint}(${maxRatingPoint})`);
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
    let partySize = partyInfo == null ? 0 : partyInfo.length;
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

    const modalId = `pop${userDivId}Modal`;
    const labelId = `pop${userDivId}ModalLabel`;

    let body = $("#templateModal").clone();
    body.attr("id", modalId);
    body.attr("aria-labelledby", labelId);
    body.find("#templateModalLabel")
        .attr("id", labelId)
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
    title.append(`<a data-toggle='modal' data-target='#${modalId}'>&nbsp;${moreIcon}</a>`);

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

function drawCharicter(charId) {
    return ` <img class='drawIcon' src='https://img-api.neople.co.kr/cy/characters/${charId}' />`;
}


function appendPlayTypeInfo(div, type, typeId, positionName, nickname) {
    let isMap = div.parent().hasClass("mapCard");
    let mapName = div.parent().data("mapname");

    let imgUrl = "http://static.cyphers.co.kr/img/game_position/";
    switch(typeId){
        case "tanker" : imgUrl += "position1.jpg";  break;
        case "melee" : imgUrl += "position2.jpg";  break;
        case "ad" : imgUrl += "position3.jpg";  break;
        case "supp" : imgUrl += "position4.jpg";  break;
    }

    let infoStr = "0% <br><small class='text-muted'> 0승 0패</small>";

    if (type != null) {
        const gameType = $("input[name='gameType']:checked").val();
        const modalId = `pop${nickname}_${gameType}_${typeId}_modal`;
        const moreIcon = '<i class="fa fa-search-plus" style="font-size:15px;color:black;"></i>';
        let moreAlink;
        if(isMap) {
            moreAlink = `<a href='#' data-toggle="modal" data-target="#${modalId}" onClick="javascript:playGameMapList('${positionName}', '${mapName}', 'position');">${moreIcon}</a>`;
        } else {
            moreAlink = `<a href='#' data-toggle="modal" data-target="#${modalId}" onClick="javascript:playGameList('${positionName}', null, '${nickname}', 'position', '${modalId}' );">${moreIcon}</a>`;
        }
        
        infoStr = `${type.rate.toFixed(0)}% ${moreAlink}<br><small class='text-muted'>${type.rateInfo}</small>`;
    }

    $(div).append(`
        <div class="card">
            <div class="row no-gutters">
                <div class="col-md-5">
                    <img src="${imgUrl}">
                </div>
                <div class="col-md-7">
                    <div class="card-body">
                        <p id="tankerSpan" class="card-text">${infoStr}</p>
                    </div>
                </div>
            </div>
        </div>`);
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
    if(info.length == 0) {
        return ;
    }
    
    let gt = 1;
    let count = Math.max(gt, info.length);
    $(div).find("#mostCharTitleDiv").text(title + count + "(" + gt + "판 이상)");
    for (let i = 0; i < count; i++) {
        drawChar(div.find("#mostCharDetailDiv"), info[i]);
    }
}

function extractChar(rows, sort) {
    const resultsMap = new Map();

    rows.forEach(({ playInfo }) => {
        const { characterName, characterId, result } = playInfo;

        if (!resultsMap.has(characterName)) {
            resultsMap.set(characterName, {
                name: characterName,
                characterId,
                count: 0,
                win: 0,
                lose: 0
            });
        }

        const characterResult = resultsMap.get(characterName);
        characterResult.count++;
        result === 'win' ? characterResult.win++ : characterResult.lose++;
    });

    const results = Array.from(resultsMap.values());
    return results.sort(sort);
}

//파티 관련 
//파티별 승률 (솔로/파티)
function drawPartyType(userDivId, clone, row) {
    let partyJson = extractParty(row);

    let soloAllCnt = partyJson.solo.win + partyJson.solo.lose;
    let partyAllCnt = partyJson.all.win + partyJson.all.lose;
    let appendHtml = "";

    appendHtml += `<b class="red">솔플</b>: ${soloAllCnt}전 ${partyJson.solo.win}승 ${partyJson.solo.lose}패, 
                   <b class="red">파티</b>: ${partyAllCnt}전 ${partyJson.all.win}승 ${partyJson.all.lose}패 <br>`;

    let index = 0;
    let moreIcon = '<i class="fa fa-search-plus" style="font-size:15px;color:black;"></i>';
    if (partyJson.two.count != 0) {
        appendHtml +=
            `&nbsp;[ <span class='blue'>2인</span>: ${partyJson.two.win}승 ${partyJson.two.lose}패 
            <a data-toggle='collapse' href='#two${userDivId}' role='button' 
                aria-expanded='false' aria-controls='two${userDivId}' >${moreIcon}</a>  ]&nbsp;`;
        index++;
    }
    if (partyJson.three.count != 0) {
        appendHtml +=
            `&nbsp;[ <span class='blue'>3인</span>: ${partyJson.three.win}승 ${partyJson.three.lose}패 
            <a data-toggle='collapse' href='#three${userDivId}' role='button' 
                aria-expanded='false' aria-controls='three${userDivId}' >${moreIcon}</a>  ]&nbsp;`;
        index++;
    }
    if (partyJson.four.count != 0) {
        if(index == 2) {
            appendHtml += "<br>";
        }
        appendHtml +=
            `&nbsp;[ <span class='blue'>4인</span>: ${partyJson.four.win}승 ${partyJson.four.lose}패 
            <a data-toggle='collapse' href='#four${userDivId}' role='button' 
	            aria-expanded='false' aria-controls='four${userDivId}' >${moreIcon}</a>  ]`;
    }

    if (partyJson.five.count != 0) {
        appendHtml +=
            `&nbsp;[ <span class='blue'>5인</span>: ${partyJson.five.win}승 ${partyJson.five.lose}패 
            <a data-toggle='collapse' href='#five${userDivId}' role='button' 
	            aria-expanded='false' aria-controls='five${userDivId}' >${moreIcon}</a>  ]`;
    }
    appendHtml += "<br><div class='row'>";

    if (partyJson.two.count != 0) {
        let partyResult = getEachPartyResult(partyJson.two.party);
        appendHtml += `<div class='collapse multi-collapse' id='two${userDivId}'>${partyResult}</div>`;
    }
    if (partyJson.three.count != 0) {
        let partyResult = getEachPartyResult(partyJson.three.party);
        appendHtml += `<div class='collapse multi-collapse' id='three${userDivId}'>${partyResult}</div>`;
    }
    if (partyJson.four.count != 0) {
        let partyResult = getEachPartyResult(partyJson.four.party);
        appendHtml += `<div class='collapse multi-collapse' id='four${userDivId}'>${partyResult}</div>`;
    }
    if (partyJson.five.count != 0) {
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

function partyUserSearch(aTagObj) {
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
        solo: { count: 0, win: 0, lose: 0 },
        all: { count: 0, win: 0,lose: 0 },
        two: { count: 0, win: 0, lose: 0, party: {} },
        three: { count: 0, win: 0, lose: 0, party: {} },
        four: { count: 0, win: 0, lose: 0, party: {} },
        five: { count: 0, win: 0, lose: 0, party: {} },
    };

    let solo = rows.filter(row => row.playInfo.partyInfo == null);
    partyResult.solo.count = solo.length;
    partyResult.solo.win = solo.filter(row => row.playInfo.result == 'win').length;
    partyResult.solo.lose = solo.filter(row => row.playInfo.result == 'lose' && row.playInfo.playTypeName == '정상').length;

    let party = rows.filter(row => row.playInfo.partyInfo != null);
    for (let i in party) {
        let matchId = party[i].matchId;
        let playInfo = party[i].playInfo;
        let cnt = playInfo.partyUserCount;

        addPlayResult(partyResult.all, matchId, playInfo, false);
        if (cnt == 2) {
            addPlayResult(partyResult.two, matchId, playInfo, true);
        } else if (cnt == 3) {
            addPlayResult(partyResult.three, matchId, playInfo, true);
        } else if (cnt == 4) {
            addPlayResult(partyResult.four, matchId, playInfo, true);
        } else if (cnt == 5) {
            addPlayResult(partyResult.five, matchId, playInfo, true);
        }
    }

    partyResult.two.party = partySort(partyResult.two.party, sortCase);
    partyResult.three.party = partySort(partyResult.three.party, sortCase);
    partyResult.four.party = partySort(partyResult.four.party, sortCase);
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

function playGameList(findId, div, nickname, showType, modalId) {
    modalId =  modalId || `pop${nickname}_${findId}_modal`;
    if ($("#" + modalId).length != 0) {
        return;
    }

    let rows = userData[nickname].matches.rows;
    if (rows == null) {
        return;
    }

    if(showType == 'position') {
        rows = rows.filter(row => row.position.name == findId);
    } else if (findId != 'all') {
        rows = rows.filter(row => row.playInfo.characterId == findId);
    }

    let clone = $("#templateModal").clone();
    const kindNmae = showType == 'position' ? findId : rows[0].playInfo.characterName;
    let title = `${nickname}의 ${kindNmae} ${rows.length} 게임`;
    clone.find("#templateModalLabel").empty().text(title);
    clone.removeAttr("id");
    clone.attr("id", modalId);

    var body = clone.find("tbody");
    rows.forEach(row => {
        const { partyInfo, result, characterId, level
                , killCount, deathCount, assistCount, attackPoint
                , damagePoint, spendConsumablesCoin, getCoin } = row.playInfo;
        
        let matchId = row.matchId;

        let text =
            `<tr>
                <td> ${row.date} </td>
                <td>${getPartyInfoText(partyInfo)}</td>
                <td><b>${winLoseKo(result)}</b></td>
                <td>${getPositionIcon(row.position.name)}</td>
                <td>${drawCharicter(characterId)}</td>
                <td>${level}</td>
                <td class='kda'>${killCount}/${deathCount}/${assistCount}</td>
                <td class='kda'>${(attackPoint / 1000).toFixed(0)}k</td>
                <td class='kda'>${(damagePoint / 1000).toFixed(0)}k</td>
                <td class='kda'>${((spendConsumablesCoin / getCoin) * 100).toFixed(0)}%</td>
                <td>
                    <i class='fas fa-angle-double-down' data-toggle='collapse' data-target='.char_${matchId}' 
                        onClick='searchMatch("${matchId}", null, "char_")' >
                </td>
                </tr>
                <tr>
                <td class='hiddenRow' colspan='12'>
                <div class='collapse char_${matchId}'></div>
                </td>
            </tr>`;

        body.append(text);
    });

    if(div == null) {
        div = $("#modalDiv");
    }

    div.append(clone);
    clone.show();
}

function highScore(a, b) {
    return b.count - a.count;
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
function extractMap(data, mapName) {
    return data.filter(row => row.map.name == mapName);
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

function drawCharCardVer(div, charInfo, nickname) {
    const {characterId, win, lose, count } = charInfo;
    let isMap = div.parent().parent().hasClass("mapCard");
    let mapName = div.parent().parent().data("mapname");

    var pov = ((win * 100) / count) || 0;

    let cardText;
    if(!isMap) {
        let modalId = `pop${nickname}_${characterId}_modal`;
        let moreIcon = '<i class="fa fa-search-plus" style="font-size:15px;color:black;"></i>';
        let moreAlink = `<a href='#'  data-toggle="modal" data-target="#${modalId}" onClick="javascript:playGameList('${characterId}', null, '${nickname}');">${moreIcon}</a>`;
        cardText = `${pov.toFixed(0)}% ${moreAlink} <br/> <small class='text-muted'>${win}승 ${lose}패</small>`;    
    } else {
        let modalId = `pop${nickname}_${mapName}_${characterId}_modal`;
        let moreIcon = '<i class="fa fa-search-plus" style="font-size:15px;color:black;"></i>';
        let moreAlink = `<a href='#'  data-toggle="modal" data-target="#${modalId}" onClick="javascript:playGameMapList('${characterId}', '${mapName}');">${moreIcon}</a>`;
        cardText = `${pov.toFixed(0)}% ${moreAlink} <br/> <small class='text-muted'>${win}승 ${lose}패</small>`;    
    }
    
    var card = $(`
            <div class="card" >
                <div class="row no-gutters">
                    <div class="col-md-5">
                        <img src='https://img-api.neople.co.kr/cy/characters/${characterId}' />
                    </div>
                    <div class="col-md-7">
                        <div class="card-body">
                            <p class="card-text">
                                ${cardText}
                            </p>
                        </div>
                    </div>
                </div>
            </div>`);
    div.append(card);
}

const drawDailyResult = (div, dailyMap) => {
    let table = "<table class='table table-bordered table-striped'>";
    let tr = "<thead><tr>"; 
    let tbody = "<tbody><tr>";
    let endTbody = "</tr></tbody></table>";

    let th = "";
    let td = "";
    let trCount = 1;
    let first = true;
    let columnNum = isMobile ? 4 : 7;

    dailyMap.forEach(function(item, key) {
        th += `<th>${key}</th>`;
        td += `<td>${item.win}승 ${item.lose}패 </td>`;
        if (trCount % columnNum == 0) {
            let newTable = table + tr + th + tbody + td + endTbody;
            th = "";
            td = "";
            if (first) {
                div.find("#dailyResult").empty().append(newTable);
                first = false;
            } else {
                div.find("#moreDailyResult").append(newTable);
            }
        }
        trCount++;
    });
}

const calcDaily = (rows) => {
    const dailyMap = new Map();
    rows.forEach(row => setMap(dailyMap, row.playInfo.result == 'win', getDay(row.date)));
    return dailyMap;
}

const setMap = (map, isWin, key) => {
    if(isWin) {
        map.set(key, {
            win: (map.get(key)?.win || 0) + 1,
            lose: map.get(key)?.lose || 0,
        });
    }else {
        map.set(key, {
            win: map.get(key)?.win || 0,
            lose: (map.get(key)?.lose || 0 ) + 1,
        });
    }
}

const getDay = (yyymmddStr) => {
    if(yyymmddStr){
        var dateParts = yyymmddStr.split(" "); // 공백을 기준으로 문자열을 나눕니다.
        return dateParts[0].slice(2);
    } else {
        return "분석중";
    }    
}