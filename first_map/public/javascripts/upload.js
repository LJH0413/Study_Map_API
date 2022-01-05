const mapContainer = document.getElementById("map");
const mapOptions = {
  center: new daum.maps.LatLng(37.554477, 126.970419),
  level: 3,
};

let map = new daum.maps.Map(mapContainer, mapOptions);

let infowindow = new daum.maps.InfoWindow({
  zIndex: 1,
});

let markerList = [];

let ps = new daum.maps.services.Places();

searchPlaces();
// 키워드 받고 검색

function searchPlaces() {
  // keyword 아이디의 값을 가져옴
  let keyword = $("#keyword").val();
  ps.keywordSearch(keyword, placesSearchCB);
}

function placesSearchCB(data, status) {
  //data 결과 status 서버상태
  if (status === daum.maps.services.Status.OK) {
    // console.log(data);
    displayPlaces(data);
  } else if (status === daum.maps.services.Status.ZERO_RESULT) {
    alert("검색 결과가 존재하지 않습니다.");
    return;
  } else if (status === daum.maps.services.Status.ERORR) {
    alert("검색 결과중 오류가 발생하였습니다.");
    return;
  }
}

function displayPlaces(data) {
  let listEl = document.getElementById("placesList");
  let bounds = new daum.maps.LatLngBounds(); //마커의 영역 표시

  removeAllChildNodes(listEl);
  removeMarker();

  for (let i = 0; i < data.length; i++) {
    let lat = data[i].y;
    let lng = data[i].x;
    let address = data[i]["address_name"];
    let title = data[i]["place_name"];

    const placePosition = new daum.maps.LatLng(lat, lng);
    bounds.extend(placePosition);

    let marker = new daum.maps.Marker({
      position: placePosition,
    });

    marker.setMap(map);
    markerList.push(marker);

    const el = document.createElement("div");
    const itemStr = `
      <div class="info">
        <div class="info_title">${title}</div>
          <span>${address}</span>
      </div>
    `;

    el.innerHTML = itemStr;
    el.className = "item";

    daum.maps.event.addListener(marker, "click", function () {
      displayInfowindow(marker, title, address, lat, lng);
    });

    daum.maps.event.addListener(map, "click", function () {
      infowindow.close();
    });

    el.onClick = function () {
      displayInfowindow(marker, title, address, lat, lng);
    };

    listEl.appendChild(el);
  }
  map.setBounds(bounds);
}

function displayInfowindow(marker, title, address, lat, lng) {
  let content = `
    <div style="padding:25px">
      ${title}<br>
      ${address}<br>
      <button onclick="onSubmit('${title}', '${address}', ${lat}, ${lng});">등록</button>
    </div>
  `;
  map.panTo(marker.getPosition());
  infowindow.setContent(content);
  infowindow.open(map, marker);
}

function onSubmit(title, address, lat, lng) {
  $.ajax({
    url: "/location",
    data: { title, address, lat, lng },
    type: "POST",
  })
    .done((response) => {
      console.log("데이터 요청 성공");
      alert("성공");
    })
    .fail((error) => {
      console.log("데이터 요청 실패");
      alert("실패");
    });
}

function removeAllChildNodes(el) {
  while (el.hasChildNodes()) {
    el.removeChild(el.lastChild);
  }
}

function removeMarker() {
  for (let i = 0; i < markerList.length; i++) {
    markerList[i].setMap(null);
  }
  markerList = [];
}