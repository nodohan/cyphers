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
                if (data.resultCode == 200) {
                    callback(data);
                } else {
                    alert(data.resultMsg);
                }
            }
        },
        error: function(data) {
            callLoadingBar(false);
            return;
        }
    }).done(function() {
        //callLoadingBar(false);
    });
    return result;
}

function numberWithCommas(x) {
    // 걍 toLocaleString() 할까..
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}