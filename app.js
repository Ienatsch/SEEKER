const zipSubmit = document.querySelector("#zipSubmit");
const results = document.querySelector("#tableBody");
const thead = document.querySelectorAll("thead")[0];
const dropdown = document.querySelector("#dropdownMessage");
const restaurantRow = document.querySelectorAll("tr");
const loadingScreen = document.querySelector("#loadingScreenModal");
const loadingBar = document.querySelector("#loadingBar");
const loadingLine = document.querySelector(".loadLine");
const infoButton = document.querySelector(".fa-info");
const infoBox = document.querySelector("#infoBox");
const dots = document.querySelectorAll(".dot");

loadingLine.addEventListener("animationend", () => {
    loadingBar.style.width = "0px";
    loadingBar.style.transition = "width 1s";
    loadingBar.children[0].innerHTML = "";
    setTimeout(() => {
        loadingBar.style.border = "none";
        loadingBar.innerHTML = "<img src='images/thumbs-up-icon.png'>";
        loadingBar.style.background = "none";
        loadingBar.style.color = "rgb(6, 202, 6)";
        loadingBar.style.width = "100%";
    }, 1000);
    setTimeout(() => {
        loadingScreen.className = "fade";
        document.querySelector("#map").style.display = "block";
    }, 2000);
})

loadingScreen.addEventListener("animationend", (e) => {
    if (e.animationName == "fadeOut" && e.elapsedTime === 1) {
        loadingScreen.style.display = "none";
    }
})

zipSubmit.addEventListener("click", () => {
    searchByZip();
    displayResults();
    dropdown.addEventListener("animationend", () => {
        dropdown.removeAttribute("class");
    })
})

function searchByZip() {
    localStorage.clear();
    const zipCode = document.querySelector("#zipInput").value;
    getResults(zipCode);
}

function getResults(zipCode) {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            localStorage.setItem("data", this.response);
        }
    };
    xhttp.open("GET", "https://us-restaurant-menus.p.rapidapi.com/restaurants/zip_code/" + zipCode, false);
    xhttp.setRequestHeader("X-RapidAPI-Host", "us-restaurant-menus.p.rapidapi.com");
    xhttp.setRequestHeader("X-RapidAPI-Key", "fa724335famshe815f4fd6d7156ep16b649jsn59d86e0b1bab");
    xhttp.send();
}

function displayResults() {
    const data = JSON.parse(localStorage.data);

    //Clears table for new search
    results.innerHTML = "";

    if (data.result.data.length == 0) {
        thead.style.visibility = "hidden";
        dropdown.style.background = "red";
        dropdown.className = "dropdownAnim";
        dropdown.innerText = "Sorry, no results found.";
        return;
    }

    thead.style.visibility = "visible";
    dropdown.style.background = "rgb(6, 202, 6)";
    dropdown.className = "dropdownAnim";
    dropdown.innerText = `We found ${data.result.data.length} results!`;

    data.result.data.forEach(x => {
        let row = results.insertRow(data.result.data.indexOf(x))
        let name = row.insertCell(0);
        let type = row.insertCell(1);
        let address = row.insertCell(2);
        let phone = row.insertCell(3);

        name.innerHTML = `${x.restaurant_name}`;
        if (x.cuisines[0] !== undefined) {
            type.innerHTML = `${x.cuisines[0]}`;
        }
        else {
            type.innerHTML = "Not Found";
        }
        address.innerHTML = `${x.address.formatted}`;
        if (x.restaurant_phone !== "") {
            phone.innerHTML = `${x.restaurant_phone}`;
        }
        else {
            phone.innerHTML = "Not Found";
        }
    })

    showOnMap(data);
}

function mouseOverMouseOut() {
    let defaultRowColor = "";

    results.addEventListener('mouseover', (e) => {
        const row = e.path[1];
        row.style.animation = "restaurantHover 1s forwards";
        row.style.boxShadow = "5px 5px 10px black";
        defaultRowColor = row.style.background;
        row.style.background = "gold";
    })

    results.addEventListener('mouseout', (e) => {
        const row = e.path[1];
        row.style.animation = "";
        row.style.boxShadow = "0px 0px";
        row.style.background = defaultRowColor;
    })
}
mouseOverMouseOut();

function initMap() {
    map = new google.maps.Map(document.querySelector('#map'), {
        center: { lat: 39.8283, lng: -98.5795 },
        zoom: 4
    });
}

function showOnMap(data) {
    results.addEventListener('click', (e) => {
        const addressOfRestaurant = e.path[1].children[2].innerText;
        data.result.data.forEach(x => {
            if (addressOfRestaurant == x.address.formatted) {
                map = new google.maps.Map(document.querySelector('#map'), {
                    center: { lat: x.geo.lat, lng: x.geo.lon },
                    zoom: 16
                });
                new google.maps.Marker({
                    position: map.center,
                    map: map,
                });
            }
        })
    })
}

infoBox.style.opacity = 0;
infoButton.addEventListener('click', () => {
    if (infoBox.style.opacity == 0) {
        infoBox.style.opacity = 1;
    }
    else {
        infoBox.style.opacity = 0;
    }
})