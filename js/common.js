function ajaxCall(url, data, callback) {
    var result;
    $.ajax({
        async: true,
        url: url,
        data: data,
        success: function(data) {
            try {
                callLoadingBar(false);
            } catch (e) {

            }

            if (typeof callback == 'function') {
                if (data.resultCode == 200 || data.rows || data.row) {
                    callback(data);
                } else {
                    alert(data.resultMsg);
                }
            }
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
    return result;
}

function numberWithCommas(x) {
    // 걍 toLocaleString() 할까..
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}