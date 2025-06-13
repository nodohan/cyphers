
const defaultInfoNormal = (divId, gameType, clone, data, tackShow) => {
    var rating = data.records.filter(game => game.gameTypeId == gameType)[0] || { loseCount: 0, stopCount: 0, winCount: 0, playCount : 0 };
    let item = $(clone);

    item.find("#nickNameDiv").append(data.nickname);
    item.find("#nickNameDiv").append(` <a href='javascript:nickHistory("${data.playerId}");' ><i class='red fas fas fa-heading'></i></a>`);
    item.find("#levelDiv").text(data.grade + "급 ");
    item.find("#clanDiv").text(data.clanName);

    getTierColerName(item.find("#tierName"), data.tierName);
    if (data.ratingPoint != null) {
        item.find("#currRP").text(data.ratingPoint || '언랭');
        item.find("#maxRP").text("(" + data.maxRatingPoint || 0 + ")");
    }
    item.find("#beforeSeason").append(`<a href='javascript:userSeasonRank("${data.playerId}", drawSeasonRank);' >전시즌</a>`);

    item.find("#playGameDiv").append(`총 ${rating.playCount} 전`);
    item.find("#tack").on("click", () => addTackUser(divId));
    item.find(".tackRemove").on("click", () => removeTackUser(divId));
    if (tackShow) {
        item.find(".tack").show();
        item.find(".tackRemove").hide();
    } else {
        item.find(".tack").hide();
        item.find(".tackRemove").show();
    }

}

//파티 관련 
//파티별 승률 (솔로/파티)
const drawPartyTypeNormal = (userDivId, clone, row) => {
    let partyJson = extractParty(row);
    const partyAllCnt = partyJson.all.count;
    let appendHtml = "";

    $(clone).parent().find("#playGameDiv").append(` (<span class="red">솔플</span>: ${partyJson.solo.count}전, <span class="red">파티</span>: ${partyAllCnt}전)<br>`);

    let moreIcon = '<i class="fa fa-search-plus" style="font-size:15px;color:black;"></i>';
    if (partyJson.two.count != 0) {
        appendHtml += drawPartInfoNormalHtml('2인', partyJson.two.count, 'two'+userDivId, moreIcon );
    }
    if (partyJson.three.count != 0) {
        appendHtml += drawPartInfoNormalHtml('3인', partyJson.three.count, 'three'+userDivId, moreIcon );
    }
    if (partyJson.four.count != 0) {
        appendHtml += drawPartInfoNormalHtml('4인', partyJson.four.count, 'four'+userDivId, moreIcon );
    }
    if (partyJson.five.count != 0) {
        appendHtml += drawPartInfoNormalHtml('5인', partyJson.five.count, 'five'+userDivId, moreIcon );
    }
    appendHtml += "<br><div class='row'>";

    if (partyJson.two.count != 0) {
        let partyResult = getEachPartyResultNormal(partyJson.two.party);
        appendHtml += `<div class='collapse multi-collapse' id='two${userDivId}'>${partyResult}</div>`;
    }
    if (partyJson.three.count != 0) {
        let partyResult = getEachPartyResultNormal(partyJson.three.party);
        appendHtml += `<div class='collapse multi-collapse' id='three${userDivId}'>${partyResult}</div>`;
    }
    if (partyJson.four.count != 0) {
        let partyResult = getEachPartyResultNormal(partyJson.four.party);
        appendHtml += `<div class='collapse multi-collapse' id='four${userDivId}'>${partyResult}</div>`;
    }
    if (partyJson.five.count != 0) {
        let partyResult = getEachPartyResultNormal(partyJson.five.party);
        appendHtml += `<div class='collapse multi-collapse' id='five${userDivId}'>${partyResult}</div>`;
    }
    appendHtml += "</div>";
    clone.append(appendHtml);
}

const drawPartInfoHtml = (win, lose, divId, moreIcon) => {
    return `&nbsp;[ <span class='blue'>2인</span>: ${partyJson.two.win}승 ${partyJson.two.lose}패 
                <a data-toggle='collapse' href='#two${userDivId}' role='button' 
                aria-expanded='false' aria-controls='two${userDivId}' >${moreIcon}</a>  ]&nbsp;`
}

const drawPartInfoNormalHtml = (title, count, userDivId, moreIcon) => {
    return `&nbsp;[ <span class='blue'>${title}</span>: ${count}전 
                <a data-toggle='collapse' href='#${userDivId}' role='button' 
                aria-expanded='false' aria-controls='${userDivId}' >${moreIcon}</a>  ]&nbsp;`
}

const extractPartyNormal = (rows) =>{
    let partyResult = {
        solo: { count: 0 },
        all: { count: 0 },
        two: { count: 0, party: {} },
        three: { count: 0, party: {} },
        four: { count: 0, party: {} },
        five: { count: 0, party: {} },
    };

    let solo = rows.filter(row => row.playInfo.partyInfo == null);
    partyResult.solo.win = solo.length;

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

const getEachPartyResultNormal = (arr) => {
    let resultTable =
        `<table class='table'> 
            <thead class='thead-dark'>
            <tr>
                <th scope='col'>파티원</th>
                <th scope='col'>겜수</th>
            </tr>
            </thead>
            <tbody>`;

    for (idx in arr) {
        let row = arr[idx];
        let total = row.count;

        resultTable += `<tr>`;
        if (pageName != 'pcDetail') {
            resultTable += `<th scope='row'> <a href='#' onClick='partyUserSearch(this);' />${row.name}</a></th>`;
        } else {
            resultTable += `<th scope='row'>${row.name}</th>`;
        }
        resultTable += `<td>${total}</td>
                    </tr>`
    }
    resultTable += "</tbody></table>";
    return resultTable;
}

const drawPositionNormal = (div, rows, nickname) => {
    let tanker = extractPlayTypeNormal(rows, "탱커");
    let ad = extractPlayTypeNormal(rows, "원거리딜러");
    let melee = extractPlayTypeNormal(rows, "근거리딜러");
    let supp = extractPlayTypeNormal(rows, "서포터");

    //포지션별 승률
    const positionDiv = $(div).find("#positionDiv");
    positionDiv.empty();
    appendPlayTypeInfoNormal(positionDiv, tanker, "tanker", "탱커", nickname); //탱커
    appendPlayTypeInfoNormal(positionDiv, melee, "melee", "근거리딜러", nickname);
    appendPlayTypeInfoNormal(positionDiv, ad, "ad", "원거리딜러", nickname);
    appendPlayTypeInfoNormal(positionDiv, supp, "supp", "서포터", nickname);
}

const extractPlayTypeNormal = (rows, type) => {
    let item = {};
    let result = rows.filter(row => row.position.name == type && row.playInfo.playTypeName == "정상");
    if (result.length == 0) {
        return null;
    }
    item["count"] = result.length +"전";
    return item;
}

const appendPlayTypeInfoNormal = (div, type, typeId, positionName, nickname) => {
    let isMap = div.parent().hasClass("mapCard");
    let mapName = div.parent().data("mapname");

    let imgUrl = "http://static.cyphers.co.kr/img/game_position/";
    switch(typeId){
        case "tanker" : imgUrl += "position1.jpg";  break;
        case "melee" : imgUrl += "position2.jpg";  break;
        case "ad" : imgUrl += "position3.jpg";  break;
        case "supp" : imgUrl += "position4.jpg";  break;
    }

    let infoStr = "0%";
    if (type != null) {
        const gameType = $("input[name='gameType']:checked").val();
        const modalId = `pop${nickname}_${gameType}_${typeId}_modal`;
        const moreIcon = '<i class="fa fa-search-plus" style="font-size:15px;color:black;"></i>';
        let moreAlink;
        if(isMap) {
            moreAlink = `<a href='#' data-toggle="modal" data-target="#${modalId}" onClick="javascript:playGameMapList('${positionName}', '${mapName}', 'position');">${moreIcon}</a>`;
        } else {
            moreAlink = `<a href='#' data-toggle="modal" data-target="#${modalId}" onClick="javascript:playGameListNormal('${positionName}', null, '${nickname}', 'position', '${modalId}' );">${moreIcon}</a>`;
        }
        infoStr = `${type.count} ${moreAlink}`;
    }

    $(div).append(`
        <div class="card">
            <div class="row no-gutters">
                <div class="col-md-5">
                    <img src="${imgUrl}">
                </div>
                <div class="col-md-7" style="align-content:center" >
                    <div class="card-body">
                        <p id="tankerSpan" class="card-text">${infoStr}</p>
                    </div>
                </div>
            </div>
        </div>`);
}

const drawOftenNormal = (div, info, nickname) => {
    let count = Math.min(isMobile ? 6 : 8, info.length);
    let rowCount = isMobile ? 6 : 8;

    $(div).find("#mostCharTitleDiv").text("자주하는캐릭 TOP" + count);
    for (let i = 0; i < count; i++) {
        drawCharCardVerNormal(div.find("#mostCharDetailDiv"), info[i], nickname);
    }
    let emptyDivCount = rowCount - count;
    if (emptyDivCount > 0) {
        for (i = 0; i < emptyDivCount; i++) {
            drawEmptyChar(div.find("#mostCharDetailDiv"));
        }
    }
}

const drawCharCardVerNormal = (div, charInfo, nickname) => {
    const {characterId, count } = charInfo;
    let isMap = div.parent().parent().hasClass("mapCard");
    let mapName = div.parent().parent().data("mapname");

    let cardText;
    if(!isMap) {
        let modalId = `pop${nickname}_${characterId}_modal`;
        let moreIcon = '<i class="fa fa-search-plus" style="font-size:15px;color:black;"></i>';
        cardText = `${count}전 <a href='#' data-toggle="modal" data-target="#${modalId}" 
                            onClick="javascript:playGameListNormal('${characterId}', null, '${nickname}');">${moreIcon}</a>`;    
    } else {
        let modalId = `pop${nickname}_${mapName}_${characterId}_modal`;
        let moreIcon = '<i class="fa fa-search-plus" style="font-size:15px;color:black;"></i>';
        cardText = `${count}전 <a href='#' data-toggle="modal" data-target="#${modalId}" 
                            onClick="javascript:playGameMapList('${characterId}', '${mapName}');">${moreIcon}</a>`;    
    }
    
    var card = $(`
            <div class="card" >
                <div class="row no-gutters">
                    <div class="col-md-5">
                        <img src='https://img-api.neople.co.kr/cy/characters/${characterId}' />
                    </div>
                    <div class="col-md-7" style="align-content:center" >
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


const drawRecentlyNormal = (div, rows, userDivId) => {
    let bodyCount = Math.min(20, rows.length);

    let title = $(div).find("#recentlyDivTitle");
    if (!isMobile) {
        title.prepend(`최근 ${bodyCount} 게임 보기`);
    }

    const modalId = `pop${userDivId}Modal`;
    const labelId = `pop${userDivId}ModalLabel`;
    const moreIcon = '<i class="fa fa-search-plus" style="font-size:15px;color:black"></i>';

    let body = $(getTempModalTableNormal(modalId, labelId,  `최근 ${bodyCount} 게임`));
    rows.sort(sortDate);
    for (let j = 0; j < bodyCount; j++) {
        body.find("tbody").append(drawInGameListNormal(rows[j]));
    }
    title.append(`<a data-toggle='modal' data-target='#${modalId}'>&nbsp;${moreIcon}</a>`);

    $("#modalDiv").append(body);
}

function drawInGameListNormal(data) {
    let matchId = data.matchId;
    let playInfo = data.playInfo;
    let score =
        `<tr>
             <td>${data.date}</td>
             <td>${getPartyInfoText(playInfo.partyInfo)}</td>
             <td>${drawCharicter(playInfo.characterId)}</td>
             <td>${playInfo.level}</td>
             <td>
                <i class='fas fa-angle-double-down' data-toggle='collapse' 
                    data-target='.m${matchId}' onClick='searchMatchNormal("${matchId}")' >
             </td>
        </tr>
        <tr>
            <td class='hiddenRow' colspan='15'>
                <div class='collapse m${matchId}'></div>
            </td>
        </tr>`;

    return score;
}

const playGameListNormal = (findId, div, nickname, showType, modalId) => {
    modalId =  modalId || `pop${nickname}_${findId}_modal`;
    const labelId = `pop${nickname}_${findId}_label`;

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

    const kindName = showType == 'position' ? findId : rows[0].playInfo.characterName;
    let title = `${nickname}의 ${kindName} ${rows.length} 게임`;
    let clone = getTempModalTableNormal(modalId, labelId, title);

    rows.forEach(row => {
        const { partyInfo, result, characterId, level } = row.playInfo;
        
        let matchId = row.matchId;
        clone +=
            `<tr>
                <td> ${row.date} </td>
                <td>${getPartyInfoText(partyInfo)}</td>
                <td>${drawCharicter(characterId)}</td>
                <td>${level}</td>
                <td>
                    <i class='fas fa-angle-double-down' data-toggle='collapse' data-target='.char_${matchId}' 
                        onClick='searchMatchNormal("${matchId}", null, "char_")' >
                </td>
            </tr>
            <tr>
                <td class='hiddenRow' colspan='12'>
                <div class='collapse char_${matchId}'></div>
                </td>
            </tr>`;
    });

    clone += `              </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>`

    if(div == null) {
        div = $("#modalDiv");
    }

    div.append(clone);
}

const getTempModalTableNormal = (modalId, labelId, title) => {
    return `
        <div id="${modalId}" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="${labelId}">
            <div class="modal-dialog modal-xl" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h4 class="modal-title" id="${labelId}">${title}</h4>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">×</span>
                    </button>
                    </div>
                    <div class="modal-body modal-dialog-scrollable">
                        <table id="templateTable" class="table table-striped table-condensed">
                            <thead class="thead-dark">
                                <tr>
                                    <th scope="col">날짜</th>
                                    <th scope="col">파티</th>
                                    <th scope="col">P</th>
                                    <th scope="col">Char</th>
                                    <th scope="col">Lv</th>
                                    <th scope="col"></th>
                                </tr>
                            </thead>
                            <tbody>`;
}

const searchMatchNormal = (matchId, callback, prefix = "m") => {
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
            drawMatchNormal(matchId, data, divId);
        }
    }).done(function() {

    });
    return result;
}

const drawMatchNormal = (matchId, result, divId) => {
    let prefixMatchId = divId;
    let data;
    if (typeof result == 'string') {
        data = JSON.parse(result);
    } else {
        data = result;
    }
    let div = $("." + prefixMatchId);
    let table = $(`
        <table id="matchInfoTemplate" class="table table-striped table-condensed">
            <thead class="thead-light">
                <tr>
                    <th scope="col"></th>
                    <th scope="col">C</th>
                    <th scope="col">P</th>
                    <th scope="col">닉네임</th>
                    <th scope="col">급</th>
                    <th scope="col">rp</th>
                    <th scope="col">Lv</th>
                    <th scope="col"> </th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    `);
    table.attr("id", prefixMatchId + "div");
    let tbody = table.find("tbody");

    let winTeam = getTeamNormal(data.teams, 0, data.players);
    let loseTeam = getTeamNormal(data.teams, 1, data.players);

    for (idx in winTeam) {
        tbody.append(drawInGameDetailNormal(matchId, winTeam[idx], "table-primary"));
    }
    for (idx in loseTeam) {
        tbody.append(drawInGameDetailNormal(matchId, loseTeam[idx], "table-danger"));
    }

    div.append(table);
}


const getTeamNormal = (team, result, players) => {
    let findTeam = team[result].players;
    let resultTeam = players.filter(player => findTeam.includes(player.playerId));
    resultTeam.forEach(item => item.playInfo.result = result);

    return resultTeam;
}

const drawInGameDetailNormal = (matchId, data, trClass) => {
    const { playInfo, items }  = data;
    let partyCnt = playInfo.partyUserCount == 0 ? "(솔플)" : `(${playInfo.partyUserCount}인)`;

    let score = `<tr class='${trClass}'>`
    const isSecond = items.some(item => item.itemName.endsWith("SU"));
    const secondIcon = "<img class='secondChar' src='/image/ee.png' />";

    score += `<td>${isSecond? secondIcon : ""}</td>
              <td>${drawCharicter(playInfo.characterId)}</td>`;
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
         <td>${playInfo.level}</td>`;

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

const drawDailyResultNormal = (div, dailyMap) => {
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
        th += `<th>${key}</th>
               <td>${item.win+item.lose}판 </td>`;
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

const playDetailGameListNormal = (charId, div) => {
    let rows = playRow;
    
    const searchPosition = positions.indexOf(charId) >= 0;
    if (charId != 'all' && !searchPosition ) {
        rows = rows.filter(row => row.playInfo.characterId == charId);
    } else if(searchPosition) {
        rows = rows.filter(row => row.position.name == charId);
    }

    var clone = $("#templateTable").clone();
    clone.removeAttr("id");

    var body = clone.find("tbody");
    const moreIcon = '<i class="fa fa-search-plus" style="font-size:15px;color:black;"></i>';
    rows.forEach(row => {
        const {result, characterId, level} = row.playInfo;
        let text = `
            <tr>
                <td> ${row.date} </td>
                <td><b>${winLoseKo(result)}</b></td>
                <td>${drawCharicter(characterId)}</td>
                <td>${level}</td>
                <td onClick='searchMatchNormal("${row.matchId}", drawMatchDetailPopupNormal )'>${moreIcon}</td>
            </tr>`;
        body.append(text);
    });

    if (div == null) {
        div = $("#con1_2");
    }
    div.find("#playGameList").empty().append(clone);
}


const drawMatchDetailPopupNormal = (matchId, result) => {
    let prefixMatchId = "m" + matchId;

    var data;
    if (result == null) {
        $("#" + prefixMatchId + "Btn").click();
        return;
    }

    if (typeof result == 'string') {
        data = JSON.parse(result);
    } else {
        data = result;
    }

    var body = $("#templateDetailModal").clone();
    body.attr("id", prefixMatchId + "Modal");
    body.attr("aria-labelledby", prefixMatchId + "ModalLabel");
    body.find("#templateDetailModalLabel")
        .attr("id", prefixMatchId + "ModalLabel")
        .text("매칭아이디: " + matchId);
    body.find("#matchInfoTemplate").attr("id", prefixMatchId + "div");
    var tbody = body.find("tbody");

    let winTeam = getTeam(data.teams, "win", data.players);
    let loseTeam = getTeam(data.teams, "lose", data.players);

    for (idx in winTeam) {
        tbody.append(drawInGameDetail(matchId, winTeam[idx], "table-primary"));
    }
    for (idx in loseTeam) {
        tbody.append(drawInGameDetail(matchId, loseTeam[idx], "table-danger"));
    }

    //클릭이벤트 설정용
    var btn = $(body).find("#matchBtn");
    btn.attr("id", prefixMatchId + "Btn");
    btn.attr("data-target", "#" + prefixMatchId + "Modal");
    $("#modalDiv").append(body);

    btn.click();
}
