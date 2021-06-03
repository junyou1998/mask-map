let nearby = 0.05; //設定定位範圍
var userLat, userLong;
let apiUrl =
    "https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json?fbclid=IwAR2c7Nn8AHmd6cOhhFvs7bRxNA62G2Dc3F9p7iuPdkZ3-LA3Rea9m-oz2VI"; //口罩存量openAPI

// 設定地圖
var map = L.map("map", { attributionControl: false, zoomControl: false }).setView([24.1618329, 120.6446744], 15);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {}).addTo(map);

// 設定地圖尺度位置
L.control
    .zoom({
        position: "topright",
    })
    .addTo(map);
// 設定綠色圖釘->貨量充足
var pinIcon = L.divIcon({
    html: "<div class='pin'></div>",
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
});
// 設定黃色圖釘->存量危及
var pinIcon_danger = L.divIcon({
    html: "<div class='pin danger'></div>",
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
});
// 設定紅色圖釘->已售完
var pinIcon_empty = L.divIcon({
    html: "<div class='pin empty'></div>",
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
});


function getData(userLat, userLong) {
    fetch(apiUrl)
        .then((res) => res.json())
        .then((data) => {
            console.log(data);
            data.features.forEach((data) => {
                var geo = data.geometry;
                var proper = data.properties;
                var lat = geo.coordinates[1];
                var long = geo.coordinates[0];
                var name = proper.name;
                var address = proper.address;
                var adult = proper.mask_adult;
                var child = proper.mask_child;
                var update = proper.updated;

                let distance = Math.sqrt(Math.pow(userLat - lat, 2) + Math.pow(userLong - long, 2));

                if (update == "") {
                    update = "未更新";
                }
                if (distance < nearby) {
                    if (adult + child == 0) {
                        L.marker([lat, long], {
                            icon: pinIcon_empty,
                        })
                            .addTo(map)
                            .bindPopup(
                                `<h4>${name}</h3><br>成人口罩:${adult}<br>小孩口罩${child}<br>地址:<a target="_blank" href="https://maps.google.com/?q=${address}">${address}</a><br>更新時間: ${update}`
                            );
                    } else if (adult + child < 50) {
                        L.marker([lat, long], {
                            icon: pinIcon_danger,
                        })
                            .addTo(map)
                            .bindPopup(
                                `<h4>${name}</h3><br>成人口罩:${adult}<br>小孩口罩${child}<br>地址:<a target="_blank" href="https://maps.google.com/?q=${address}">${address}</a><br>更新時間: ${update}`
                            );
                    } else {
                        L.marker([lat, long], {
                            icon: pinIcon,
                        })
                            .addTo(map)
                            .bindPopup(
                                `<h4>${name}</h3><br>成人口罩:${adult}<br>小孩口罩${child}<br>地址:<a target="_blank" href="https://maps.google.com/?q=${address}">${address}</a><br>更新時間: ${update}`
                            );
                    }
                } else {
                }
            });
        });
}
getposition()
function getposition(){
    map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
            console.log("remove~");
        }
    });
    navigator.geolocation.getCurrentPosition(function (pos) {
        userLat = pos.coords.latitude;
        userLong = pos.coords.longitude;
        map.panTo(new L.LatLng(userLat, userLong));

        getData(userLat, userLong);
    });
}

$("#reset").click(function(){
    getposition()
})

setInterval(function () {  getposition()}, 60000);
