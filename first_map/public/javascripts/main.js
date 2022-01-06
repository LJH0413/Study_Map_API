// 지도 api 불러오기
const mapOptions = {
  center: new naver.maps.LatLng(37.3595704, 127.105399),
  zoom: 10,
};

const map = new naver.maps.Map("map", mapOptions);

$.ajax({
  url: "/location",
  type: "GET",
}).done((response) => {
  if (response.message !== "success") return;
  const data = response.data;

  let markerList = [];
  let infowindowList = [];

  const getClickHandler = (i) => () => {
    const marker = markerList[i];
    const infowindow = infowindowList[i];
    if (infowindow.getMap()) {
      infowindow.close();
    } else {
      infowindow.open(map, marker);
    }
  };

  const getClickMap = (i) => () => {
    const infowindow = infowindowList[i];
    infowindow.close();
  };

  for (let i in data) {
    const target = data[i];
    const latlng = new naver.maps.LatLng(target.lat, target.lng);

    let marker = new naver.maps.Marker({
      map: map,
      position: latlng,
      // 마커 커스터마이징
      icon: {
        content: `<div class="marker"></div>`,
        // 중심좌표 설정
        anchor: new naver.maps.Point(7.5, 7.5),
      },
    });

    // 인포윈도우 안에 내용
    const content = `
    <div class="infowindow_wrap">
      <div class="infowindow_title">${target.title}</div>
      <div class="infowindow_address">${target.address}</div>
    </div>
  `;

    const infowindow = new naver.maps.InfoWindow({
      content: content,
      backgroundColor: "#00ff0000",
      borderColor: "#00ff0000",
      anchorSize: new naver.maps.Size(0, 0),
    });

    markerList.push(marker);
    infowindowList.push(infowindow);
  }

  for (let i = 0, ii = markerList.length; i < ii; i++) {
    naver.maps.Event.addListener(markerList[i], "click", getClickHandler(i));
    naver.maps.Event.addListener(map, "click", getClickMap(i));
  }

  // 10개 이하 1, 10 ~ 100개 2, 100개 이상 3
  const cluster1 = { content: `<div class="cluster1"></div>` };
  const cluster2 = { content: `<div class="cluster2"></div>` };
  const cluster3 = { content: `<div class="cluster3"></div>` };

  const markerClustering = new MarkerClustering({
    minClusterSize: 2,
    maxZoom: 12,
    map: map,
    markers: markerList,
    disableClickZoom: false,
    gridSize: 20, //사이즈로 조정 가능
    icons: [cluster1, cluster2, cluster3],
    indexGernertor: [2, 5, 10],
    stylingFunction: (clusterMarker, count) => {
      $(clusterMarker.getElement()).find("div:first-child").text(count);
    },
  });
});

// 행정구역 표시
const urlPrefix = "https://navermaps.github.io/maps.js/docs/data/region";
const urlSuffix = ".json";

let regionGeoJson = [];
let loadCount = 0;

const tooltip = $(
  `<div style="position:absolute; z-index:1000; padding:5px 10px; background:white; border:1px solid black; font-size:14px; display:none; pointer-events:none;" ></div>`
);

tooltip.appendTo(map.getPanes().floatPane);

naver.maps.Event.once(map, "init_stylemap", () => {
  for (let i = 1; i < 18; i++) {
    let keyword = i.toString();
    if (keyword.length === 1) {
      keyword = "0" + keyword;
    }
    $.ajax({
      url: urlPrefix + keyword + urlSuffix,
    }).done((geojson) => {
      regionGeoJson.push(geojson);
      loadCount++;
      if (loadCount === 17) {
        startDataLayer();
      }
    });
  }
});

function startDataLayer() {
  map.data.setStyle((feature) => {
    const styleOptions = {
      fillColor: "#F7969E",
      fillOpacity: 0.0001,
      strokeColor: "#F7969E",
      strokeWeight: 2,
      strokeOpacity: 0.4,
    };

    if (feature.getProperty("focus")) {
      styleOptions.fillOpacity = 0.6;
      styleOptions.fillColor = "#B0D9E6";
      styleOptions.strokeColor = "#B0D9E6";
      styleOptions.strokeWeight = 4;
      styleOptions.strokeOpacity = 1;
    }

    return styleOptions;
  });

  regionGeoJson.forEach((geojson) => {
    map.data.addGeoJson(geojson);
  });

  map.data.addListener("click", (e) => {
    let feature = e.feature;
    if (feature.getProperty("focus") !== true) {
      feature.setProperty("focus", true);
    } else {
      feature.setProperty("focus", false);
    }
  });

  map.data.addListener("mouseover", (e) => {
    let feature = e.feature;
    let regionName = feature.getProperty("area1");
    tooltip
      .css({
        display: "block",
        left: e.offset.x,
        top: e.offset.y,
      })
      .text(regionName);
    map.data.overrideStyle(feature, {
      fillOpacity: 0.6,
      strokeWeight: 4,
      strokeOpacity: 1,
    });
  });

  map.data.addListener("mouseout", (e) => {
    tooltip.hide().empty();
    map.data.revertStyle();
  });
}
