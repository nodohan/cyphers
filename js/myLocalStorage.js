
const addSearchHistory = (nickName) => {
    const searches = JSON.parse(localStorage.getItem('searchHistory')) || [];
    const index = searches.indexOf(nickName);
    if (index > -1) {
        searches.splice(index, 1);
    }
    searches.unshift(nickName);
    if (searches.length > 10) {
        searches.pop();
    }
    localStorage.setItem('searchHistory', JSON.stringify(searches));

    if(index < 0) {
        $("#topHistory").append(drawSearchHistory(nickName));
    }
}

const searchHistory = () => {
  return JSON.parse(localStorage.getItem('searchHistory')) || [];
}
  
const delSearchHistory = (name) => {
  $("#spanSearch_"+name).remove();
  const searches = JSON.parse(localStorage.getItem('searchHistory')) || [];
  const index = searches.indexOf(name);
  if (index > -1) {
    searches.splice(index, 1);
  }
  localStorage.setItem('searchHistory', JSON.stringify(searches));
}

const showSearchHistory = () => {
    const historyDiv = $("#topHistory").empty()
    const drawFunc = IsDetailPage() ? drawSearchHistoryDetail : drawSearchHistory;
    const list = searchHistory();
    list.forEach(nickName => {
        historyDiv.append(drawFunc(nickName));
    });
}

const IsDetailPage = () => {
    return pageName == "mDetail" ||  pageName == "pcDetail";
}

const drawSearchHistory = (nickName) => {
    if (pageName === "pcDetail") {
        return `
            <li class="red historyItem" id="spanSearch_${nickName}">
                <a href='javascript:searchUser("nickNames", "con1_2", "${nickName}");'>${nickName}</a>
                <a href='javascript:delSearchHistory("${nickName}")' class="deleteHistroyButton"></a>
            </li>`
    } else {
        return `
            <span class="red" id="spanSearch_${nickName}">
                <a href='javascript:searchUser("nickNames", "con1_2", "${nickName}");'>${nickName}</a>
                <a href='javascript:delSearchHistory("${nickName}")'>[x]</a>
            </span>`
    }
}

const drawSearchHistoryDetail = (nickName) => {
    return `
            <li class="red historyItem" id="spanSearch_${nickName}">
                <a href='javascript:searchUser("nickNames", null, "${nickName}", setUserDetailInfo);'>${nickName}</a> 
                <a href='javascript:delSearchHistory("${nickName}")' class="deleteHistroyButton"></a>
            </li>`
}
