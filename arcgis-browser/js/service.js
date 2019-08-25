// Get query string value by key
function qs(key) {
    key = key.replace(/[*+?^$.\[\]{}()|\\\/]/g, "\\$&"); // escape RegEx meta chars
    var match = location.search.match(new RegExp("[?&]"+key+"=([^&]+)(&|$)"));
    return match && decodeURIComponent(match[1].replace(/\+/g, " "));
}

$(document).ready(function() {

    // Get the map url from query string
    var serviceUrl = qs('url');
    if(!serviceUrl) return;

    // Get the service description in JSON
    $.ajax({
        dataType: "json",
        url: serviceUrl,
        data: {
            f: 'json',
        },
        success: function(data) {
            if(!data.layers) {
                console.error('No layer found');
                return;
            }

            /*
            "layers": [
                {
                    "id": 0,
                    "name": "Hydrants",
                    "parentLayerId": -1,
                    "defaultVisibility": true,
                    "subLayerIds": null,
                    "minScale": 3000,
                    "maxScale": 0
                },
                */
            data.layers.forEach(function(layer){
                var layerUrl = serviceUrl + '/' + layer.id;
                var cleanUrl = window.location.href.split("?")[0].split("#")[0];
                var layerPageUrl = cleanUrl.replace(new RegExp("(.*/)[^/]+$"),"$1") + 'layer.html?url=' + encodeURI(layerUrl);

                $('#services').append(`<a href="${layerPageUrl}" target="_blank">${layer.name}</a> <br/>`);
            });
        }
    });
});