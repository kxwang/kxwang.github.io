// Collect server URL and display layer tree
arcgis = function () {
    var current = null;
    function init() { }
    function change() { }
    function verify() { }
    return {
        init: init,
        set: change
    }
}();


$(document).ready(function() {
    $('#submit').click(function(){
        // Get the server description in JSON
        var serverUrl = $('#url').val();
        $.ajax({
            dataType: "json",
            url: serverUrl,
            data: {
                f: 'json',
            },
            success: function(data) {
                if(!data.services) {
                    console.error('No services found');
                    return;
                }

                $('#server-result').empty();
                /*
                    "services": [{
                        "name": "Public/Address_Geocoding_PDX",
                        "type": "GeocodeServer"
                    }]
                 */
                data.services.forEach(function(service){
                    // Remove the last part of URL
                    service.url = serverUrl.replace(new RegExp("(.*/)[^/]+$"),"$1") + service.name + '/' + service.type;
                    var servicePageUrl = window.location.href.replace(new RegExp("(.*/)[^/]+$"),"$1") + 'service.html?url=' + encodeURI(service.url);
                    $('#server-result').append(`<a href="${servicePageUrl}" target="_blank">${service.name}</a> (${service.type}) <br/>`);
                });
            }
          });
    });
});