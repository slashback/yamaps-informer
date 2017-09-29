package main

import (
    "os"
    "fmt"
    "time"
    "net/http"
    "encoding/json"
    "regexp"
    "strconv"
    "../models"
)

type chartLine struct {
    RouteID int
    RouteName string    `json:"name"`
    Timestamps []int    `json:"values"`
}

type chart struct {
    Data []chartLine    `json:"data"`
    Labels []string     `json:"labels"`
}

type chartList struct {
    ChartList []chart   `json:"chart_list"`
}

type AuthData struct {
    Password string    `json:"password"`
}

func getBeginningOfTheDay(timestamp time.Time) time.Time {
    year, month, day := timestamp.Date()
    return time.Date(year, month, day, 0, 0, 0, 0, timestamp.Location())
}

func getEndOfTheDay(timestamp time.Time) time.Time {
    tomorrow := timestamp.Add(24 * time.Hour)
    year, month, day := tomorrow.Date()
    return time.Date(year, month, day, 0, 0, 0, 0, timestamp.Location())
}

func getDateByDaysAgo(timestamp time.Time, daysAgo int) time.Time {
    shift := -time.Duration(daysAgo * 24)
    tomorrow := timestamp.Add(shift * time.Hour)
    return tomorrow
}

func remapDurations(rawDurations map[int]map[string]int, timestamps *[]string, routes []*models.Route, chartRoutes map[int][]int) chartList{
    chartListItem := make([]chart, 0)
    for chartID, routeIDS := range chartRoutes {
        fmt.Println(chartID, routeIDS)
        lines := make([]chartLine, 0)
        for _, routeID := range routeIDS {
            lineValues := make([]int, 0)
            durations := rawDurations[routeID]
            for _, timestamp := range *timestamps {
                lineValues = append(lineValues, durations[timestamp])
            }
            line := chartLine{routeID, "routeName", lineValues}
            lines = append(lines, line)
        }
        chartItem := chart{lines, *timestamps}
        chartListItem = append(chartListItem, chartItem)
    }
    return chartList{chartListItem}
}

func getDurationsByDate(from time.Time, till time.Time) chartList{
    timestamps := models.GetUniqueDurationTimestamps(from, till)
    durationsMap := models.GetDurationsByDate(from, till)
    routes := models.GetRoutes()
    routeCharts := models.GetRoutesByCharts()

    return remapDurations(durationsMap, &timestamps, routes, routeCharts)
}

func handleGetCharts(daysShift int)  chartList{
    targetDay := getDateByDaysAgo(time.Now(), daysShift)
    timeFrom := getBeginningOfTheDay(targetDay)
    timeTill := getEndOfTheDay(targetDay)
    charts := getDurationsByDate(timeFrom, timeTill)
    return charts
}

func chartsHandler(w http.ResponseWriter, r *http.Request) {
    start := time.Now()
    w.Header().Set("Content-Type", "application/json")
    daysShiftRegex := regexp.MustCompile(`\d+$`)
    match := daysShiftRegex.FindStringSubmatch(r.RequestURI)[0]
    daysShift, err := strconv.Atoi(match)
    if err != nil {
        fmt.Println(err)
        daysShift = 0
    }
    charts := handleGetCharts(daysShift)
    chartJSON, _ := json.Marshal(charts)
    elapsed := time.Since(start)
    fmt.Printf("took %s\n", elapsed)
    fmt.Fprintf(w, string(chartJSON))
}

func chartListHandler(w http.ResponseWriter, r *http.Request) {
    charts := models.GetCharts()
    chartJSON, _ := json.Marshal(charts)
    fmt.Fprintf(w, string(chartJSON))
}

func routeListHandler(w http.ResponseWriter, r *http.Request) {
    routes := models.GetRoutes()
    routesJSON, _ := json.Marshal(routes)
    fmt.Fprintf(w, string(routesJSON))
}

func routeUpdateHandler(w http.ResponseWriter, r *http.Request) {
    re, _ := regexp.Compile(`\d+$`)
    values := re.FindStringSubmatch(r.RequestURI)

    decoder := json.NewDecoder(r.Body)
    var route models.Route
    err := decoder.Decode(&route)
    if err != nil {
        panic(err)
    }

    if len(values) > 0 {
        routeID, err := strconv.Atoi(values[0])
        if err != nil {
            panic(err)
        } else {
            models.UpdateRoute(route)
            fmt.Fprintf(w, "{uid: \"%d\"}", routeID)
        }
    } else {
        uid := models.AddRoute(route)
        fmt.Fprintf(w, "{uid: \"%d\"}", uid)
    }
}

func authHandler(w http.ResponseWriter, r *http.Request) {
    decoder := json.NewDecoder(r.Body)
	var authData AuthData
	err := decoder.Decode(&authData)
	if err != nil {
		panic(err)
	}
    if (authData.Password == "qwe") {
        fmt.Fprintf(w, "wabwabwab")
    } else {
        w.WriteHeader(http.StatusUnauthorized)
        w.Write([]byte("Auth failed"))
    }
}


func initDB() {
    dbUser := os.Getenv("PG_APP_USER")
    dbPass := os.Getenv("PG_APP_PASS")
    const dbName = "routes"
    dbinfo := fmt.Sprintf("postgres://%s:%s@localhost/%s?sslmode=disable", dbUser, dbPass, dbName)
    models.InitDB(dbinfo)
}

func main() {
    initDB()
    // start := time.Now()
    // _ = handleGetCharts(13) // for debug
    // elapsed := time.Since(start)
    // fmt.Printf("took %s\n", elapsed)
    http.HandleFunc("/api/formatted_charts/", chartsHandler)
    http.HandleFunc("/api/charts/", chartListHandler)
    http.HandleFunc("/api/routes/", routeListHandler)
    http.HandleFunc("/api/route/", routeUpdateHandler)
    http.HandleFunc("/api/auth/", authHandler)
    http.ListenAndServe(":8080", nil)
}
