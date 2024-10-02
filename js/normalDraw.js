
const drawNormalUserInfo = (gameType, divName, data, nickname) => {
    var userDivId = getUserDivId(gameType, nickname);
    if ($("#" + userDivId).length != 0) {
        return;
    }

    //기본 정보 
    var clone = $("#template").clone();
    clone.attr("id", userDivId);
    if (divName == "con2_2") {
        clone.removeClass("infoDiv");
        clone.addClass("infoDivRed");
    }

    defaultInfoNormal(userDivId, gameType, clone, data, divName != "con3_2");

    var rows = data.matches.rows.filter(row => row.playInfo.playTypeName == "정상" || row.playInfo.result == "승리" ).sort((a, b) => new Date(b.date) - new Date(a.date));
    //printChar(rows);

    //파티별
    drawPartyTypeNormal(userDivId, clone.find("#playParty"), rows);

    //포지션별 
    drawPositionNormal(clone, rows, data.nickname);

    //자주하는 캐릭
    var userChar = extractChar(rows, sortCase);
    drawOftenNormal(clone, userChar, nickname);

    //최근 10경기 결과
    drawRecentlyNormal(clone, rows, userDivId);

    clone.show();
    $("#" + divName).prepend(clone);
}

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
            moreAlink = `<a href='#' data-toggle="modal" data-target="#${modalId}" onClick="javascript:playGameList('${positionName}', null, '${nickname}', 'position', '${modalId}' );">${moreIcon}</a>`;
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
                            onClick="javascript:playGameList('${characterId}', null, '${nickname}');">${moreIcon}</a>`;    
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

    let body = $("#templateModal").clone();
    body.attr("id", modalId);
    body.attr("aria-labelledby", labelId);
    body.find("#templateModalLabel")
        .attr("id", labelId)
        .empty()
        .append(`최근 ${bodyCount} 게임`);

    rows.sort(sortDate);
    let titleText = "";
    let moreIcon = '<i class="fa fa-search-plus" style="font-size:15px;color:black"></i>';
    title.append(titleText);
    title.append(`<a data-toggle='modal' data-target='#${modalId}'>&nbsp;${moreIcon}</a>`);

    $("#modalDiv").append(body);
}