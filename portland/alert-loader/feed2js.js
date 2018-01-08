(function () {
    if (typeof NodeList.prototype.forEach === "function") return false;
    NodeList.prototype.forEach = Array.prototype.forEach;
})();

function formatBytes(bytes) {
    if (bytes < 1024) return bytes + " Bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(0) + " KB";
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(0) + " MB";
};


function createFeedHTML(feedDivElement) {
    var feedURL = feedDivElement.getAttribute('data-feed');

    var request = new XMLHttpRequest();
    request.open('GET', feedURL, true);

    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            // Success!
            try {
                feedData = (new DOMParser()).parseFromString(request.responseText, 'text/xml');
            } catch (e) {
                feedDivElement.previousElementSibling.textContent += ' (Failed to retrieve Alerts)';


                var listItemAnchor = jQuery('li[data-feedid="' + feedDivElement.id + '"] > a');
                if (listItemAnchor) {
                    listItemAnchor.text(listItemAnchor.text() + ' (Failed to retrieve Alerts)');
                }

                console.log('Cannot find the channel node. Invalid RSS XML: ', feedURL);
                return;
            }
            var channel = feedData.querySelector('channel');
            if (!channel) {
                feedDivElement.previousElementSibling.textContent += ' (Failed to retrieve Alerts)';


                var listItemAnchor = jQuery('li[data-feedid="' + feedDivElement.id + '"] > a');
                if (listItemAnchor) {
                    listItemAnchor.text(listItemAnchor.text() + ' (Failed to retrieve Alerts)');
                }

                console.log('Cannot find the channel node. Invalid RSS XML: ', feedURL);
                return;
            }


            // If there is no feed item, update the title and return
            var feedItemsNodeList = channel.querySelectorAll('item');
            if (feedItemsNodeList.length === 0) {
                feedDivElement.previousElementSibling.textContent += ' (No Alert)';


                var listItemAnchor = jQuery('li[data-feedid="' + feedDivElement.id + '"] > a');
                if (listItemAnchor) {
                    listItemAnchor.text(listItemAnchor.text() + ' (No Alert)');
                }

                return;
            }

            // feed info
            var feedHtml = '<div class="rss-title"><a href="' +
                channel.querySelector('link').textContent + '">' +
                channel.querySelector('title').textContent +
                '</a></div>'; // skip description as it's generic
            feedHtml += '<ul>';
            // feed item info
            var itemLimit = 3; // only show the first few items
            feedItemsNodeList.forEach(function (item) {
                if (itemLimit-- <= 0) return;

                feedHtml += '<li class="rss-item"><a href="' +
                    item.querySelector('link').textContent +
                    '">' +
                    item.querySelector('title').textContent +
                    '</a>' +
                    // publish date
                    '<br /><span class="rss-date">' +
                    new Date(item.querySelector('pubDate').textContent).toLocaleString() +
                    '</span>' +
                    '<br />' + item.querySelector('description').textContent;

                var mediaContents = item.querySelectorAll('media\\:content, content');
                if (mediaContents.length > 0) {
                    feedHtml += '<div class="rss-item-media"><p>Media files</p><ul>';
                    mediaContents.forEach(function (mediaContent) {
                        var url = mediaContent.getAttribute('url');
                        var fileName = url.substring(url.lastIndexOf('/') + 1);
                        var fileSize = formatBytes(+mediaContent.getAttribute('fileSize'));
                        feedHtml += '<li><a href="' + url +
                            '" title="' + mediaContent.getAttribute('type') + '">' +
                            fileName + '</a>(' + fileSize + ')'

                        feedHtml += '</li>';
                    });
                    feedHtml += '</ul></div>';
                }
                feedHtml += '</li>';
            });
            feedHtml += '</ul>';

            feedDivElement.innerHTML = feedHtml;

        } else {
            // We reached our target server, but it returned an error

        }
    };

    request.onerror = function () {
        // There was a connection error of some sort
    };

    request.send();

}

document.addEventListener('DOMContentLoaded', function () {
    // find all the feed nodes
    var feedDivElements = document.querySelectorAll('div.feed');
    feedDivElements.forEach(createFeedHTML);

    jQuery('#feed-accordion').accordion({
        heightStyle: "content",
        active: false,
        collapsible: true,

        activate: function (event, ui) {
            if (!jQuery.isEmptyObject(ui.newHeader.offset())) {
                jQuery('html:not(:animated), body:not(:animated)').animate({ scrollTop: ui.newHeader.offset().top - 20 }, 'slow');
            }
        }

    });


    jQuery("#feed-accordion").on("accordionbeforeactivate", function (event, ui) {
        if (ui.newPanel.find('.rss-item').length == 0) event.preventDefault();
    });


    jQuery('div.columnwrapper').on('click', 'li', function (e) {
        if (jQuery(this).attr('data-feedid') === undefined) return;
        var accordionPanelIndex = jQuery('div.feed').index(jQuery('div.feed#' + jQuery(this).attr('data-feedid')));
        jQuery("#feed-accordion").accordion("option", "active", +accordionPanelIndex);

    });

});
