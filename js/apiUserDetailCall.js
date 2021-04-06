function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최소값은 포함
}

function search(inputId) {
    var names = $("#" + inputId).val().split(" ");
    names.forEach(name => searchUser(inputId, name));
}

function searchUser(inputId, nickName) {
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
            setUserInfo(gameType, data);
        }
    }).done(function() {

    });
}

function isDuplicate(gameType, nickName) {
    return $("#" + getUserDivId(gameType, nickName)).length != 0;
}

function setUserInfo(gameType, data) {
    $("#con1_2").empty();
    $("#con2_2").empty();

    drawLeftInfo(gameType, data);
    drawRightInfo(gameType, data);
}

function drawRightInfo(gameType, data) {
    $("#")

}







// -------------------LEFT SIDE -----------------------------

function drawLeftInfo(gameType, data) {
    var rating = data.records.filter(game => game.gameTypeId == gameType)[0];
    var pov = (rating.winCount * 100) / (rating.winCount + rating.loseCount);

    //기본 정보
    var clone = $("#template").clone();
    clone.attr("id", getUserDivId(gameType, data.nickname));
    $(clone).find("#gameTypeDiv").text("[" + (gameType == 'rating' ? "공식전" : "일반전") + "]");
    $(clone).find("#nickNameDiv").text(data.nickname);
    $(clone).find("#levelDiv").text(data.grade + "급");
    $(clone).find("#clanDiv").text(data.clanName);

    $(clone).find("#currRP").text(data.ratingPoint);
    $(clone).find("#maxRP").text(data.maxRatingPoint);
    //$(clone).find("#playGameDiv").text("승률 : " + pov.toFixed(0) + "% [" + (rating.winCount + rating.loseCount) + "전 " + rating.winCount + "승 " + rating.loseCount + "패 " + rating.stopCount + "중단]");
    $(clone).find("#playGameDiv").text("승률 : " + pov.toFixed(0) + "% [" + rating.winCount + "승 " + rating.loseCount + "패 " + rating.stopCount + "중단]");

    var rows = data.matches.rows;

    var tanker = extractPlayType(rows, "탱커");
    var ad = extractPlayType(rows, "원거리딜러");
    var melee = extractPlayType(rows, "근거리딜러");
    var supp = extractPlayType(rows, "서포터");

    //포지션별 승률
    appendPlayTypeInfo(clone, tanker, "tanker"); //탱커
    appendPlayTypeInfo(clone, melee, "melee");
    appendPlayTypeInfo(clone, ad, "ad");
    appendPlayTypeInfo(clone, supp, "supp");

    //최근 5경기 결과
    drawRecently(clone, rows);

    //자주하는 캐릭
    var userChar = extractChar(rows);
    drawOften(clone, userChar);

    clone.show();
    $("#con1_2").prepend(clone);
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

function extractChar(rows) {
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
    charNames.forEach(name =>
        sorted.push(result[name])
    );
    sorted.sort(sortCase);
    return sorted;
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