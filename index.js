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
const graph1 = document.querySelector("#chart-left")
const graph2 = document.querySelector("#chart-right")
let merge = false
let coinLeft = "bitcoin"
let coinRight = ""

//to hide all data div when website init
singleChartDiv.style.display = "none"
compareChartsDiv.style.display = "none"

mergeButton.addEventListener("click", () => {
    mergeButton.disabled = true

    if (!merge) {
        graph1.style.left = "25%"
        graph2.style.left = "-25%"
        graph2.style.opacity = "0.5"
        mergeButton.textContent = "Unmerge"
        merge = true
    } else {
        graphReset()
        setTimeout(() => graph2.style.opacity = "1", 5000)
    }
    setTimeout(() => mergeButton.disabled = false, 5500)
})

//function to reset graphs position
function graphReset(){
    graph1.style.left = "0"
    graph2.style.left = "0"
    merge = false
    mergeButton.textContent = "Merge"
}

twentyFourHours.addEventListener("click", () => {
    getCoinHistory(coinLeft, 1, "min", "single", drawGoogleChart)
})

sevenDays.addEventListener("click", () => {
    getCoinHistory(coinLeft, 7, "daily", "single", drawGoogleChart)
})

thirtyDays.addEventListener("click", () => {
    getCoinHistory(coinLeft, 30, "daily", "single", drawGoogleChart)
})

oneYear.addEventListener("click", () => {
    getCoinHistory(coinLeft, 365, "daily", "single", drawGoogleChart)
})

twentyFourHoursCompare.addEventListener("click", () => {
    getCoinHistory(coinLeft, 1, "min", "left", drawGoogleChart)
    getCoinHistory(coinRight, 1, "min", "right", drawGoogleChart)
})

sevenDaysCompare.addEventListener("click", () => {
    getCoinHistory(coinLeft, 7, "daily", "left", drawGoogleChart)
    getCoinHistory(coinRight, 7, "daily", "right", drawGoogleChart)
})

thirtyDaysCompare.addEventListener("click", () => {
    getCoinHistory(coinLeft, 30, "daily", "left", drawGoogleChart)
    getCoinHistory(coinRight, 30, "daily", "right", drawGoogleChart)
})

oneYearCompare.addEventListener("click", () => {
    getCoinHistory(coinLeft, 365, "daily", "left", drawGoogleChart)
    getCoinHistory(coinRight, 365, "daily", "right", drawGoogleChart)
})

//to show top 10 coins and refresh every 10 secs
getTopCoins(10)
const intervalID = setInterval(getTopCoins, 10000, 10)


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
        getCoinHistory(coinId, 1, "min", "single", drawGoogleChart)
        getCurrentData(coinId, "")
        graphReset()
        graph2.style.opacity = "1"
    })
}

//to get input from form
formSingle.addEventListener("submit", e => {
    e.preventDefault()
    let input = e.target["single_coin"].value
    checkInput(input)
        .then(result => {
            if (result){
                coinLeft = result
                singleChartDiv.style.display = "flex"
                compareChartsDiv.style.display = "none"
                getCurrentData(coinLeft, "")
                getCoinHistory(coinLeft, 1, "min", "single", drawGoogleChart)
                graphReset()
                graph2.style.opacity = "1"
                e.target.reset()
            } else {
                alert("invalid input")
            }
        })
})

//det input from compare form
formMultiple.addEventListener("submit", e => {
    e.preventDefault()
    let input = e.target["compare_coins"].value
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
                e.target.reset()
            } else {
                alert("invalid input")
            }
        })
})

//function to check form input
function checkInput(input) {
    if (input === "") input = "aaaaaaa"
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
    fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days > 2 ? days - 1 : 1}&interval=${interval}`)
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
            // console.log(prices)
            f(prices, coinId, days, interval, position)
        })
        .catch(console.error)
}

//------------------------------------------------google chart------------------------------------------------

function drawGoogleChart(dataArr, coinId, days, interval, position) {
    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(drawChart);
    
    const coinName = coinId.substring(0, 1).toUpperCase() + coinId.substring(1)
    let output = [];
    if (position === "right"){
        output = interval === "daily" ? [[`${days}days Data`, "", coinName]] : [["24 hrs Data", "", coinName]]
        dataArr.forEach(data => {
            if (interval === "daily"){
                output.push([`${data.month}/${data.day}`, 0, data.price])
            } else {
                output.push([data.hour, 0, data.price])
            }
        })
    } else {
        output = interval === "daily" ? [[`${days}days Data`, coinName]] : [["24 hrs Data", coinName]]
        dataArr.forEach(data => {
            if (interval === "daily"){
                output.push([`${data.month}/${data.day}`, data.price])
            } else {
                output.push([data.hour, data.price])
            }
        })
    }

    function drawChart() {
        const data = google.visualization.arrayToDataTable(output)
        const title = interval === "daily" ? `${days} Days Data` : "Last 24 hrs Data"

        const options = {
            title: `${coinName} Performance`,
            hAxis: {title: title,  titleTextStyle: {color: '#333'}},
            vAxis: {minValue: 0},
        };

        const chart = new google.visualization.AreaChart(document.getElementById(`chart-${position}`));
        chart.draw(data, options);
    }
}

