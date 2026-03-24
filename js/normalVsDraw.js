
function drawVsNormal(result) {

    $(".specialVsPanel").removeClass("vs-rating-mode").addClass("vs-normal-mode");
    $("#con1_2").empty();
    $("#con2_2").empty();

    console.log(result.team);

    drawTeamNormal("con1_2", result.team);
    drawTeamNormal("con2_2", result.enemy);
}

function drawTeamNormal(divId, team) {
    $("#" + divId).append(
        `<h4>승리: <span class='red'>${team.win}</span> 
             패배: <span class='blue'>${team.lose}<span></h4>`);

    var clone = $("#templateTableNormal").clone();
    clone.removeAttr("id");

    var body = clone.find("tbody");
    let moreIcon = '<i class="fa fa-search-plus" style="font-size:15px;color:black;"></i>';

    team.row.forEach(row => {
        body.append(
            `<tr>
                <td>${row.date}</td>
                ${drawInGameScoreNormal(row.my)}
                ${drawInGameScoreNormal(row.you)}
                <td onClick='searchMatchNormal("${row.matchId}", drawMatchVsNormal )'>${moreIcon}</td> 
            </tr>`);
    });
    $("#" + divId).append(clone);
}

function drawInGameScoreNormal(data) {
    return `<td>${drawCharicter(data.charId)}</td>`;
}

function drawMatchVsNormal(matchId, result) {
    let prefixMatchId = "m" + matchId;

    if (result == null) {
        const existingModal = document.getElementById(prefixMatchId + "Modal");
        if (existingModal) {
            bootstrap.Modal.getOrCreateInstance(existingModal).show();
        }
        return;
    }

    var data;
    if (typeof result == 'string') {
        data = JSON.parse(result);
    } else {
        data = result;
    }

    var body = $("#templateModalNormal").clone();
    body.attr("id", prefixMatchId + "Modal");
    body.attr("aria-labelledby", prefixMatchId + "ModalLabel");
    body.find("#templateModalNormalLabel")
        .attr("id", prefixMatchId + "ModalLabel")
        .text("매칭아이디:" + matchId);
    body.find("#matchInfoTemplate").attr("id", prefixMatchId + "div");
    var tbody = body.find("tbody");

    let winTeam = getTeam(data.teams, "win", data.players);
    let loseTeam = getTeam(data.teams, "lose", data.players);

    for (idx in winTeam) {
        tbody.append(drawInGameDetailNormal(matchId, winTeam[idx], "table-primary"));
    }
    for (idx in loseTeam) {
        tbody.append(drawInGameDetailNormal(matchId, loseTeam[idx], "table-danger"));
    }

    //클릭이벤트 설정용
    $("#modalDiv").append(body);
    bootstrap.Modal.getOrCreateInstance(body[0]).show();
}
