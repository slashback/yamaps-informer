package main

import (
    "os"
    "fmt"
    "time"
    "net/http"
    "encoding/json"
    "./models"
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

func addDuration(storage map[int]map[string]int, routeID int, checkTime string, duration int) {
    mm, ok := storage[routeID]
    if !ok {
        mm = make(map[string]int)
        storage[routeID] = mm
    }
    mm[checkTime] = duration
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

// debug function
func handleGetCharts(daysShift int) {
    targetDay := getDateByDaysAgo(time.Now(), daysShift)
    timeFrom := getBeginningOfTheDay(targetDay)
    timeTill := getEndOfTheDay(targetDay)
    charts := getDurationsByDate(timeFrom, timeTill)
    chartJSON, _ := json.Marshal(charts)
    fmt.Sprintf(string(chartJSON))
}

func chartsHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    daysShift := 12
    targetDay := getDateByDaysAgo(time.Now(), daysShift)
    timeFrom := getBeginningOfTheDay(targetDay)
    timeTill := getEndOfTheDay(targetDay)
    charts := getDurationsByDate(timeFrom, timeTill)
    chartJSON, _ := json.Marshal(charts)
    fmt.Println(string(chartJSON))
    fmt.Fprintf(w, string(chartJSON))
}

func main() {
    start := time.Now()
    dbUser := os.Getenv("PG_APP_USER")
    dbPass := os.Getenv("PG_APP_PASS")
    const dbName = "routes"
    dbinfo := fmt.Sprintf("postgres://%s:%s@localhost/%s", dbUser, dbPass, dbName)
    models.InitDB(dbinfo)
    handleGetCharts(13) // for debug
    elapsed := time.Since(start)
    fmt.Printf("took %s", elapsed)
    http.HandleFunc("/api/charts", chartsHandler)
    http.HandleFunc("/api/charts/0", chartsHandler)
    http.ListenAndServe(":8080", nil)
}