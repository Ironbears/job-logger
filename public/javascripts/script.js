document.addEventListener('DOMContentLoaded', () => {

  console.log('IronGenerator JS imported successfully!');

}, false);

let map;
let markers = [];

function populateSearchboxLocation(val) {
  axios({
    url: 'https://api.graphql.jobs/',
    method: 'POST',
    data: {
    query: `
      query allTheCities {
        cities{name}
      }
    `}
  })
  .then(result => {
    const elSearchBox = document.querySelector('select#location');
    const cities = result.data.data.cities.sort((a,b) => a.name.localeCompare(b.name));
    let options = `<option value='' ${!val?'selected="true"':''}">All location</option>`;

    cities.forEach(city=>{
      options+= `<option value="${city.name}" ${val.toLowerCase()===city.name.toLowerCase()?'selected="true"':''}>${city.name}</option>`;
    });
    elSearchBox.innerHTML = options;
  });
}

function initMap() {
  var mapOptions = {
    zoom: 4,
    center: new google.maps.LatLng(52.52000659999999,13.404954)
  };

  map = new google.maps.Map(
    document.querySelector('#jobs-map'), mapOptions
  );
}

function addMarker(location, text) {
  const marker = new google.maps.Marker({
    position: location,
    map: map,
    title: text
  });
  if(!markers.includes(marker)) markers.push(marker);
}

function setMapOnAll(map) {
  if(markers.length !== 0)
    markers[markers.length - 1].setMap(map);
}

function clearMarkers() {
  setMapOnAll(null);
}

function sanitizeLocation(location) {
  let sanitizedLocation = location.split(',');
  switch(sanitizedLocation.length) {
    case 0: 
      return;
    case 1: 
      sanitizedLocation = 
        (location.includes('remote') && location.includes('(')) ?
          location.slice(location.indexOf('(') + 1,location.indexOf(')')) : 
          (location.split('or')) ?
            sanitizedLocation[0].split('or')[0] :
            sanitizedLocation[0];
      break;
    default:
      sanitizedLocation = sanitizedLocation[0] + ', ' + sanitizedLocation[1];
  }
  return sanitizedLocation;
}

function updateMapPosition(location = "Berlin, Germany", jobTitle = "") {

  const request = {
    query: sanitizeLocation(location),
    fields: ['name', 'geometry'],
  };
  
  const service = new google.maps.places.PlacesService(map);

  service.findPlaceFromQuery(request, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      map.setCenter(results[0].geometry.location);

      clearMarkers();
      addMarker(results[0].geometry.location, jobTitle ? jobTitle : '');
    }
  });
}