function requestEuropeana(term, dataCallbackFct) {

    var xhr = new XMLHttpRequest();
    xhr.open('GET',
        'http://europeana.eu/api//v2/search.json?wskey='
            + 'kfUs6T3Kj'
            + '&query=' + term
            + '&rows=200&profile=facets', true);

    xhr.onload = function() {

        var res = JSON.parse(xhr.response);
        var processedData = preprocessData(res);
        dataCallbackFct(processedData, res.items);
    };
    xhr.onerror = function() {
        console.log("error");
    };
    xhr.send();
}

function loadDetailedInfo(link, container, fctCallback) {

    var xhr = new XMLHttpRequest();
    xhr.timeout = 5000;
    xhr.open('GET', link, true);

    xhr.onload = function() {

        var info = JSON.parse(xhr.response);
        fctCallback(info, container, true);
    };

//    xhr.onreadystatechange = function(){
//        if (xhr.readyState == 4 && xhr.status == 200) {
//            clearTimeout(xhrTimeout);
//        }
//    };
//
//    var xhrTimeout=setTimeout(ajaxTimeout,5000);
//    function ajaxTimeout(){
//        xhr.abort();
//        fctCallback(null, container, false);
//    }

    xhr.onerror = function() {
        console.log("error");
    };
    xhr.send();
}

function preprocessData(data) {
    var processedData = [];
    var colors = {
        "UGC":"#FFE4CC",
        "country":"#FFFDC9",
        "dataProvider": "#E6FFC7",
        "language": "#C7FFF2",
        "provider": "#C9E2FF",
        "rights": "#F2CCFF",
        "type": "#FFC9E5",
        "year": "#CCFFD3"
    };
    var facets = {
        "UGC": {},
        "country": {},
        "dataProvider": {},
        "language": {},
        "provider": {},
        "rights": {},
        "type": {},
        "year": {}
    };
    for(var key in facets) {
        for(var i = 0; i < data.items.length; i++) {
            if(data.items[i].hasOwnProperty(key)) {
                if(data.items[i][key] instanceof Array) {
                    for(var t = 0; t < data.items[i][key].length; t++) {
                        var ctag = getCanonicalString(data.items[i][key][t]);
                        facets[key][ctag] = (typeof facets[key][ctag] == "undefined" ? 1 : ++facets[key][ctag]);
                    }
                } else {
                    var ctag = getCanonicalString(data.items[i][key]);
                    facets[key][ctag] = (typeof facets[key][ctag] == "undefined" ? 1 : ++facets[key][ctag]);
                }
            }
        }
        var tags = [];
        for(var t in facets[key]) {
            tags.push({"word":t, "frequency":facets[key][t]});
        }
        if(tags.length > 1) {
            processedData.push({"name":key, "color": colors[key], "tags":tags});
        }
    }
    delete facets;
    return processedData;
}

function getCanonicalString(str) {
    var arrOfStr = str.toLowerCase().split(" ");
    var canonStr = "";
    if(str.match("http") || str.match("www")) {
        return str;
    }
    for(var i = 0; i < arrOfStr.length; i++) {
        canonStr += arrOfStr[i].charAt(0).toUpperCase() + arrOfStr[i].slice(1);
        if(i < arrOfStr.length - 1) {
            canonStr += " ";
        }
    }
    return canonStr;
}