package main

import (
    "database/sql"
    "fmt"
    _ "github.com/lib/pq"
    "time"
    "net/http"
    "encoding/json"
)

const (
    dbUser     = "postgres"
    dbPassword = "postgres"
    dbName     = "routes"
)

// Routes route
type Routes struct {
    routeID int
    name string
}

type pgChartRouteItem struct {
    chartID     int
    chartName   string
    routeID     int
}

func contains(s []string, e string) bool {
    for _, a := range s {
        if a == e {
            return true
        }
    }
    return false
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

func buildChartRoutesMap(routes []pgChartRouteItem) map[int][]int {
    result := make(map[int][]int)
    for _, item := range routes {
        result[item.chartID] = append(result[item.chartID], item.routeID)
    }
    return result
}


func getChartsRoutes() map[int][]int {
    routes := make([]pgChartRouteItem, 0)
    dbinfo := fmt.Sprintf("user=%s password=%s dbname=%s sslmode=disable",
        dbUser, dbPassword, dbName)
    db, err := sql.Open("postgres", dbinfo)
    checkErr(err)
    defer db.Close()
    chartRoutes, err := db.Query(`
        SELECT c.uid, c.name, r.uid
        FROM charts c
        JOIN chart_routes cr on c.uid = cr.chart_id
        JOIN routes r on r.uid = cr.route_id
        ORDER BY c.uid, r.uid     
    `)
    checkErr(err)

    for chartRoutes.Next() {
        var chartID int
        var chartName string
        var routeID int
        err = chartRoutes.Scan(&chartID, &chartName, &routeID)
        checkErr(err)
        item := pgChartRouteItem{chartID, chartName, routeID}
        routes = append(routes, item)
    }
    chartRouteMap := buildChartRoutesMap(routes)
    return chartRouteMap
}

func formatTimeStamp(timestamp time.Time) string {
    return timestamp.Format("15:04")
}

type pgDurationItem struct {
    routeID   int
    duration  string
}

func getUniqueDurationTimestamps(from time.Time, till time.Time) []string {
    timestamps := make([]string, 0)
    dbinfo := fmt.Sprintf("user=%s password=%s dbname=%s sslmode=disable",
        dbUser, dbPassword, dbName)
    db, err := sql.Open("postgres", dbinfo)
    checkErr(err)
    defer db.Close()
    stmt, err := db.Prepare(`
        SELECT distinct TO_CHAR(durations.check_time, 'HH24:MI') from durations 
        where check_time between $1 and $2 order by TO_CHAR(durations.check_time, 'HH24:MI')
    `)
    checkErr(err)
    durations, err := stmt.Query(from, till)
    checkErr(err)
    for durations.Next() {
        var timestamp string
        err = durations.Scan(&timestamp)
        checkErr(err)
        if contains(timestamps, timestamp) != true {
            timestamps = append(timestamps, timestamp)
        }
    }
    return timestamps
}

func addDuration(storage map[int]map[string]int, routeID int, checkTime string, duration int) {
    mm, ok := storage[routeID]
    if !ok {
        mm = make(map[string]int)
        storage[routeID] = mm
    }
    mm[checkTime] = duration
}

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

func remapDurations(rawDurations map[int]map[string]int, timestamps *[]string, routes *[]Routes, chartRoutes map[int][]int) chartList{
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

func fetchDurationsByDate(from time.Time, till time.Time) *sql.Rows {
    dbinfo := fmt.Sprintf("user=%s password=%s dbname=%s sslmode=disable",
        dbUser, dbPassword, dbName)
    db, err := sql.Open("postgres", dbinfo)
    checkErr(err)
    defer db.Close()
    stmt, err := db.Prepare("SELECT uid, route_id, duration, check_time FROM durations where check_time between $1 and $2")
    checkErr(err)
    durations, err := stmt.Query(from, till)
    checkErr(err)
    return durations
}

func getRoutes() []Routes {
    routesList := make([]Routes, 0)
    dbinfo := fmt.Sprintf("user=%s password=%s dbname=%s sslmode=disable",
        dbUser, dbPassword, dbName)
    db, err := sql.Open("postgres", dbinfo)
    checkErr(err)
    defer db.Close()
    routes, err := db.Query("SELECT uid, name FROM routes")
    checkErr(err)

    for routes.Next() {
        var uid int
        var name string
        err = routes.Scan(&uid, &name)
        checkErr(err)
        routesList = append(routesList, Routes{uid, name})
    }
    return routesList
}

func getDurationsByDate(from time.Time, till time.Time) chartList{
    durationsMap := make(map[int]map[string]int)
    timestamps := getUniqueDurationTimestamps(from, till)
    durations := fetchDurationsByDate(from, till)
    routes := getRoutes()
    routeCharts := getChartsRoutes()

    for durations.Next() {
        var uid int
        var routeID int
        var duration int
        var checkTime time.Time
        err := durations.Scan(&uid, &routeID, &duration, &checkTime)
        checkErr(err)
        formattedCheckTime := formatTimeStamp(checkTime)
        addDuration(durationsMap, routeID, formattedCheckTime, duration)
    }

    return remapDurations(durationsMap, &timestamps, &routes, routeCharts)
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

func checkErr(err error) {
    if err != nil {
        panic(err)
    }
}

func main() {
    start := time.Now()
    handleGetCharts(12)
    elapsed := time.Since(start)
    fmt.Printf("took %s", elapsed)
    http.HandleFunc("/api/charts", chartsHandler)
    http.HandleFunc("/api/charts/0", chartsHandler)
    http.ListenAndServe(":8080", nil)
}