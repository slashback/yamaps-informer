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

func initDB() {
    dbUser := os.Getenv("PG_APP_USER")
    dbPass := os.Getenv("PG_APP_PASS")
    const dbName = "routes"
    dbinfo := fmt.Sprintf("postgres://%s:%s@localhost/%s", dbUser, dbPass, dbName)
    models.InitDB(dbinfo)
}

func main() {
    initDB()
    // start := time.Now()
    // _ = handleGetCharts(13) // for debug
    // elapsed := time.Since(start)
    // fmt.Printf("took %s\n", elapsed)
    http.HandleFunc("/api/formatted_charts/", chartsHandler)
    http.ListenAndServe(":8080", nil)
}
