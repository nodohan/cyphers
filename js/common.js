function ajaxCall(url, data, callback) {
    var result;
    $.ajax({
        async: true,
        url: url,
        data: data,
        success: function(data) {
            if (typeof callback == 'function') {
                if (data.resultCode == 200) {
                    callback(data);
                } else {
                    alert(data.resultMsg);
                }
            }
        },
        error: function(data) {
            return;
        }
    }).done(function() {

    });
    return result;
}

function numberWithCommas(x) {
    // 걍 toLocaleString() 할까..
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}