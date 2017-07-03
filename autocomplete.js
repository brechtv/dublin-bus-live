var options = {

    url: "bus_stops.json",
    
    adjustWidth: false,

    categories: [{
        listLocation: "stops",
        maxNumberOfElements: 2,
    }],

    getValue: function(element) {
        return element.label;
    },

    template: {
        type: "description",
        fields: {
            description: "category"
        }
    },

    list: {
        maxNumberOfElements: 8,
        match: {
            enabled: true
        },
        sort: {
            enabled: true
        },
        onClickEvent: function() {
            $('#search').trigger('click');
        }
    }
};

$("#stop_id").easyAutocomplete(options);