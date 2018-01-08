module.exports = {
    updateAlert: function () {
        function updateEvent(event, delta, revertFunc) {
            $.ajax({
                type: 'PATCH',
                headers: {
                    'Accept': "application/vnd.api+json",
                    "Content-Type": "application/vnd.api+json"
                },
                url: '/jsonapi/node/meeting/' + event.id,
                dataType: 'json',
                data: JSON.stringify({
                    "data": {
                        "id": event.id,
                        "attributes": {
                            'field_meeting_time': {
                                'value': event.start.local().utc().format('YYYY-MM-DD[T]HH:mm:ss'),
                                'end_value': event.end.local().utc().format('YYYY-MM-DD[T]HH:mm:ss')
                            }
                        }
                    }
                }),
                success: function (jsonData) {
                },
                error: function (jsonData) {
                    revertFunc();
                    console.error(jsonData);
                }
            });

        }
    },
};