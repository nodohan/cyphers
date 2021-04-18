$(document).ready(function() {
    if (isIe()) {
        alert("IE는 제공하지 않습니다 ㅈㅅ ㅠㅠ..\nEdge나 chrome을 이용해주세요");
        $("input").attr("disabled", true);
        $("#main > .top").prepend("<span class='red'><b>IE는 제공하지 않습니다. 크롬 또는 엣지를 이용해주세요.</b></span>");
    }
});

function isIe() {
    var agent = navigator.userAgent.toLowerCase();
    return (navigator.appName == 'Netscape' && agent.indexOf('trident') != -1) || (agent.indexOf("msie") != -1);
}