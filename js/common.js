function ajaxCall(url, callback) {
    var result;
    $.ajax({
        async: true,
        url: url,
        success: function(data) {
            if (typeof callback == 'function') {
                callback(data);
            }
        },
        error: function(data) {
            return;
        }
    }).done(function() {

    });
    return result;
}