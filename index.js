const topTenList = document.querySelector("#top-ten")
const singleChartDiv = document.querySelector("#coins")
const compareChartsDiv = document.querySelector("#comparing-data")
const formSingle = document.querySelector("#single")
const formMultiple = document.querySelector("#multiple")
const twentyFourHours = document.querySelector("#day")
const sevenDays = document.querySelector("#week")
const thirtyDays = document.querySelector("#month")
const oneYear = document.querySelector("#year")

const twentyFourHoursCompare = document.querySelector("#day-compare")
const sevenDaysCompare = document.querySelector("#week-compare")
const thirtyDaysCompare = document.querySelector("#month-compare")
const oneYearCompare = document.querySelector("#year-compare")

const mergeButton = document.querySelector("#merge")
const detailsLeft = document.querySelector("#left")
const detailsRight = document.querySelector("#right")
const chart1 = document.querySelector("#chart-left")
const chart2 = document.querySelector("#chart-right")
const chartMerge = document.querySelector("#chart-merge")

let merge = false
let coinLeft = "bitcoin"
let coinRight = ""
let pricesLeft = []
let pricesRight = []
let days = 1;
let interval = "min"

//----------- codes to initizalize the webpage ----------
//to hide all data div when website init
singleChartDiv.style.display = "flex"
compareChartsDiv.style.display = "none"
chartMerge.style.display = "none"

//to show top 10 coins and refresh every 10 secs
getTopCoins(10)
const intervalID = setInterval(getTopCoins, 10000, 10)

//to show bitcoin data when page load
getCoinHistory(coinLeft, 1, "min", "single", drawGoogleChart)
getCurrentData(coinLeft, "")

//--------------------------------------------------------

//----------- add eventListeners to all buttons ------------------
mergeButton.addEventListener("click", () => {
    if (!merge) {
        chart1.style.display = "none"
        chart2.style.display = "none"
        chartMerge.style.display = "block"
        drawGoogleChartMerge(pricesLeft, pricesRight, days, interval)
        mergeButton.textContent = "Unmerge"
        merge = true
    } else {
        chartReset()
    }
})

//function to reset charts position
function chartReset(){
    chart1.style.display = "block"
    chart2.style.display = "block"
    chartMerge.style.display = "none"
    getCoinHistory(coinLeft, days, interval, "left", drawGoogleChart)
    getCoinHistory(coinRight, days, interval, "right", drawGoogleChart)
    merge = false
    mergeButton.textContent = "Merge"
}

twentyFourHours.addEventListener("click", () => {
    getCoinHistory(coinLeft, 1, "min", "single", drawGoogleChart)
        .then(() => {
            days = 1
            interval = "min"
        })
})

sevenDays.addEventListener("click", () => {
    getCoinHistory(coinLeft, 7, "daily", "single", drawGoogleChart)
        .then(() => {
            days = 7
            interval = "daily"
        })
})

thirtyDays.addEventListener("click", () => {
    getCoinHistory(coinLeft, 30, "daily", "single", drawGoogleChart)
        .then(() => {
            days = 30
            interval = "daily"
        })
})

oneYear.addEventListener("click", () => {
    getCoinHistory(coinLeft, 365, "daily", "single", drawGoogleChart)
        .then(() => {
            days = 365
            interval = "daily"
        })
})

twentyFourHoursCompare.addEventListener("click", () => {
    const promises = []
    promises.push(getCoinHistory(coinLeft, 1, "min", "left", drawGoogleChart))
    promises.push(getCoinHistory(coinRight, 1, "min", "right", drawGoogleChart))
    Promise.all(promises)
        .then(() => {
            days = 1
            interval = "min"
            drawGoogleChartMerge(pricesLeft, pricesRight, days, interval)
        })
})

sevenDaysCompare.addEventListener("click", () => {
    const promises = []
    promises.push(getCoinHistory(coinLeft, 7, "daily", "left", drawGoogleChart))
    promises.push(getCoinHistory(coinRight, 7, "daily", "right", drawGoogleChart))
    Promise.all(promises)
        .then(() => {
            days = 7
            interval = "daily"
            drawGoogleChartMerge(pricesLeft, pricesRight, days, interval)
        })
})

thirtyDaysCompare.addEventListener("click", () => {
    const promises = []
    promises.push(getCoinHistory(coinLeft, 30, "daily", "left", drawGoogleChart))
    promises.push(getCoinHistory(coinRight, 30, "daily", "right", drawGoogleChart))
    Promise.all(promises)
        .then(() => {
            days = 30
            interval = "daily"
            drawGoogleChartMerge(pricesLeft, pricesRight, days, interval)
        })
})

oneYearCompare.addEventListener("click", () => {
    const promises = []
    promises.push(getCoinHistory(coinLeft, 365, "daily", "left", drawGoogleChart))
    promises.push(getCoinHistory(coinRight, 365, "daily", "right", drawGoogleChart))
    Promise.all(promises)
        .then(() => {
            days = 365
            interval = "daily"
            drawGoogleChartMerge(pricesLeft, pricesRight, days, interval)
        })
})
//---------------------------------------------------------------------------------

//fetch real time data for top coins
function getTopCoins(num) {
    fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${num}&page=1&sparkline=false`)
        .then(res => res.json())
        .then(showTopTenCoins)
}

//show coin data on the top menu
function showTopTenCoins(coins) {
    topTenList.innerHTML = ""
    coins.forEach(coin => {
        const div = document.createElement("div")
        const img = document.createElement("img")
        const priceDiv = document.createElement("div")
        const symbol = document.createElement("p")
        const price = document.createElement("span")

        div.id = "hoverable"
        div.style.display = "flex"
        img.src = coin.image
        img.style.width = "30px"
        img.style.objectFit = "contain"
        img.style.margin = "5px"
        symbol.textContent = `${coin.symbol.toUpperCase()} : `
        price.textContent = coin.current_price > 2 ? `$${coin.current_price.toFixed(2)}` : `$${coin.current_price}`
        price.style.color = coin.price_change_percentage_24h >= 0 ? "green" : "red"

        priceDiv.append(symbol)
        symbol.append(price)
        div.append(img, priceDiv)
        topTenList.append(div)

        addListener(div, coin.id)
    })
}

//add event listener to top 10 list
function addListener(div, coinId) {
    div.addEventListener("click", () => {
        coinLeft = coinId
        singleChartDiv.style.display = "flex"
        compareChartsDiv.style.display = "none"
        days = 1
        interval = 1
        getCoinHistory(coinId, 1, "min", "single", drawGoogleChart)
        getCurrentData(coinId, "")
        chartReset()
    })
}

//function to check form input
function checkInput(input) {
    return fetch(`https://api.coingecko.com/api/v3/search?query=${input}`)
        .then(res => res.json())
        .then(data => {
            if (data.coins[0]) {
                return data.coins[0].id
            } else {
                return false
            }
        })
        .catch(console.error)
}

//function to get current data for a coin
function getCurrentData(coinId, s) {
    fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`)
        .then(res => res.json())
        .then(data => {
            // console.log(data)
            showDataMain(data, s)
        })
        .catch(console.error)
}

//function to show current coin data on main
function showDataMain(data, s) {
    const coinImg = document.querySelector(`#coinIcon${s}`)
    const coinName = document.querySelector(`#coinName${s}`)
    const coinRank = document.querySelector(`#rank${s}`)
    const coinPrice = document.querySelector(`#price${s}`)
    const coinMarketCap = document.querySelector(`#cap${s}`)
    const coin24High = document.querySelector(`#ath${s}`)
    const coin24Low = document.querySelector(`#atl${s}`)
    const coinAllTimeHigh = document.querySelector(`#high24${s}`)
    const coinAllTimeLow = document.querySelector(`#low24${s}`)
    const coin24Change = document.querySelector(`#change24${s}`)

    coinImg.src = data.image.thumb
    coinName.textContent = data.name
    coinRank.textContent = data.market_cap_rank
    coinPrice.textContent = `$${data.market_data.current_price.usd.toLocaleString(undefined, {minimumFractionDigits: 2})}`
    coinMarketCap.textContent = `$${data.market_data.market_cap.usd.toLocaleString(undefined, {maximumFractionDigits: 0})}`
    coin24High.textContent = `$${data.market_data.high_24h.usd.toLocaleString(undefined, {minimumFractionDigits: 2})}`
    coin24Low.textContent = `$${data.market_data.low_24h.usd.toLocaleString(undefined, {minimumFractionDigits: 2})}`
    coinAllTimeHigh.textContent = `$${data.market_data.ath.usd.toLocaleString(undefined, {minimumFractionDigits: 2})}`
    coinAllTimeLow.textContent = `$${data.market_data.atl.usd.toLocaleString(undefined, {minimumFractionDigits: 2})}`
    coin24Change.textContent = data.market_data.price_change_percentage_24h > 0 ? `+${data.market_data.price_change_percentage_24h}%` : `${data.market_data.price_change_percentage_24h}%`
    coin24Change.style.color = data.market_data.price_change_percentage_24h >= 0 ? "green" : "red"
}

//function to get historical data
function getCoinHistory(coinId, days, interval = "daily", position, f = drawGoogleChart) {
    return fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days > 2 ? days - 1 : 1}&interval=${interval}`)
        .then(res => res.json())
        .then(data => {
            const prices = []
            data.prices.forEach(price => {
                const dateObj = new Date(price[0])
                let year = dateObj.getFullYear();
                let month = dateObj.getMonth() + 1;
                let day = dateObj.getDate();
                let hour = dateObj.toLocaleTimeString("it-IT").slice(0, 5);
                prices.push({
                    year: year,
                    month: month,
                    day: day,
                    hour: hour,
                    price: price[1]
                })
            })
            if (position === "right"){
                pricesRight = [...prices]
            } else {
                pricesLeft = [...prices]
            }
            // console.log(prices)
            f(prices, coinId, days, interval, position)
        })
        .catch(console.error)
}

//------------------------------------------------ google chart ------------------------------------------------
//function to draw chart on main, left or right, base on position
function drawGoogleChart(dataArr, coinId, days, interval, position) {
    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(drawChart);
    
    const coinName = coinId.substring(0, 1).toUpperCase() + coinId.substring(1)
    
    const output = interval === "daily" ? [[`${days}days Data`, coinName]] : [["24 hrs Data", coinName]]
    dataArr.forEach(data => {
        if (interval === "daily"){
            output.push([`${data.month}/${data.day}`, data.price])
        } else {
            output.push([data.hour, data.price])
        }
    })
    

    function drawChart() {
        const data = google.visualization.arrayToDataTable(output)
        const title = interval === "daily" ? `${days} Days Data` : "Last 24 hrs Data"
        const color = position === "right" ? "#e7711b" : "#1c91c0"

        const options = {
            title: `${coinName} Performance`,
            hAxis: {title: title,  titleTextStyle: {color: '#333'}},
            vAxis: {
                minValue: 0,
                format: "currency"
            },
            series: {0: {color: color}}
        };

        const chart = new google.visualization.AreaChart(document.getElementById(`chart-${position}`));
        chart.draw(data, options);
    }
}

//function to draw the merge chart
function drawGoogleChartMerge(priceLeft, pricesRight, days, interval) {
    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(drawChart);
    
    const coinNameLeft = coinLeft.substring(0, 1).toUpperCase() + coinLeft.substring(1)
    const coinNameRight = coinRight.substring(0, 1).toUpperCase() + coinRight.substring(1)
    
    output = interval === "daily" ? [[`${days}days Data`, coinNameLeft, coinNameRight]] : [["24 hrs Data", coinNameLeft, coinNameRight]]
    for (let i = 0; i < priceLeft.length; i++){
        if (interval === "daily"){
            output.push([`${priceLeft[i].month}/${priceLeft[i].day}`, pricesLeft[i].price, pricesRight[i].price])
        } else {
            output.push([priceLeft[i].hour, priceLeft[i].price, pricesRight[i].price])
        }
    }

    function drawChart() {
        const data = google.visualization.arrayToDataTable(output)
        const title = interval === "daily" ? `${days} Days Data` : "Last 24 hrs Data"

        const options = {
            title: `${coinNameLeft} and ${coinNameRight} Performance Compare`,
            hAxis: {title: title,  titleTextStyle: {color: '#333'}},
            vAxis: {
                minValue: 0,
                format: "currency",
                // gridlines: {color: "transparent"}
            },
            series:{
                0:{targetAxisIndex:0},
                1:{targetAxisIndex:1}
            }
        };

        const chart = new google.visualization.AreaChart(document.getElementById(`chart-merge`));
        chart.draw(data, options);
    }
}


//----------------AUTO COMPLETE----------------//
fetch('https://api.coingecko.com/api/v3/coins')
    .then(res => res.json())
    .then(createArray)

let coins = []

function createArray(data){
    data.forEach(coin => {
        let id = coin.symbol

        if(id.toString().length === 3){
            id.toUpperCase()
            coins.push(id)
        }
        else{

        }
    })
}


function autocomplete(inp,arr){
    var currentFocus;
    inp.addEventListener("input", function(e) {
        var a,b,i,val = this.value;
        closeAllLists();
        if(!val){return false;}
        currentFocus = -1;
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        this.parentNode.appendChild(a);

        for(i = 0; i < arr.length; i++){
            if(arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()){
                b = document.createElement("div");
                b.innerHTML = "<strong>" + arr[i].substr(0,val.length) + "</strong>";
                b.innerHTML += arr[i].substr(val.length);
                b.innerHTML += "<input type = 'hidden' value = '" + arr[i] + "'>";
                b.addEventListener("click", function(e){
                    inp.value = this.getElementsByTagName("input")[0].value;
                    closeAllLists();
                });
            a.appendChild(b);
            }
        }
    
    })


inp.addEventListener("keydown", function(e){
    var x = document.getElementById(this.id + "autocomplete-list")
    if (x) x = x.getElementsByTagName("div"); 
    if(e.keyCode == 40){
        currentFocus++;
        addActive(x);
    }else if(e.keyCode == 38){
        currentFocus--;
        addActive(x);
    }else if(e.keyCode == 13){
        e.preventDefault();
        if(currentFocus > -1){
            if (x) x[currentFocus].click();
        }
    }
})

function addActive(x) {
    if(!x) return false;
    removeActive(x);
    if(currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    x[currentFocus].classList.add("autocomplete-active");
}

function removeActive(x) {
    for(var i = 0; i < x.length; i++){
        x[i].classList.remove("autocomplete-active");
    }
}

function closeAllLists(elmnt){
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++){
        if (elmnt != x[i] && elmnt != inp){
            x[i].parentNode.removeChild(x[i]);
        }
    }
}
document.addEventListener("click", function (e) {
    closeAllLists(e.target);
});
}

autocomplete(document.getElementById("singleInput"), coins)
autocomplete(document.getElementById("multipleInput"), coins)

formSingle.addEventListener("submit", e => {
     e.preventDefault()
         let input = e.target["singleInput"].value
         checkInput(input)
             .then(result => {
                 if (result){
                    coinLeft = result
                     singleChartDiv.style.display = "flex"
                     compareChartsDiv.style.display = "none"
                     getCurrentData(coinLeft, "")
                     getCoinHistory(coinLeft, 1, "min", "single", drawGoogleChart)
                     chartReset()
                     chart2.style.opacity = "1"
                     days = 1
                     interval = "min"
                     e.target.reset()
                 } else {
                     alert("invalid input")
                 }
             })
        console.log("test")
     })

//get input from compare form
 formMultiple.addEventListener("submit", e => {
     e.preventDefault()
     let input = e.target["multipleInput"].value
     checkInput(input)
         .then(result => {
             if (result){
                 coinRight = result
                 singleChartDiv.style.display = "none"
                 compareChartsDiv.style.display = "block"
                 getCurrentData(coinLeft, "-left")
                 getCurrentData(coinRight, "-right")
                 getCoinHistory(coinLeft, 1, "min", "left", drawGoogleChart)
                 getCoinHistory(coinRight, 1, "min", "right", drawGoogleChart)
                 days = 1
                 interval = "min"
                 chartReset()
                 e.target.reset()
             } else {
                 alert("invalid input")
             }
         })
 })