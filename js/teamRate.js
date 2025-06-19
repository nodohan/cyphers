let teamRed = [] ;
let teamBlue = [] ;

const callTeamRate  =  (playerId, team, callback) => {    
    //callLoadingBar(true);
    const teamArr  =  team == "red" ? teamRed : teamBlue;
    teamArr.push(playerId);

    if(teamArr.length == 1) {
        return ;
    }

    $.ajax({
        async: true,
        url: "/matchesMap/teamRate",
        data: {"playerIds" : teamArr},
        success: function(data) {
            try {
                //callLoadingBar(false);
            } catch (e) {

            }
            callback(team, data);
        },
        error: function(data) {
            if (typeof callLoadingBar == 'function') {
                callLoadingBar(false);
            }
            return;
        }
    }).done(function() {
        if (typeof callLoadingBar == 'function') {
            callLoadingBar(false);
        }
    });
}