package models

import (
	"time"
)

// Route route
type Route struct {
    routeID int
    name string
}

type duration struct {
	durationID int
	routeID int
	duration int
	checkTime time.Time
}

type chartRouteItem struct {
    chartID     int
    chartName   string
    routeID     int
}

func formatTimeStamp(timestamp time.Time) string {
    return timestamp.Format("15:04")
}

func contains(s []string, e string) bool {
    for _, a := range s {
        if a == e {
            return true
        }
    }
    return false
}

// GetRoutes represents list of route items
func GetRoutes() []*Route {
    routesList := make([]*Route, 0)
    routes, err := db.Query("SELECT uid, name FROM routes")
	defer routes.Close()
	if err != nil {
        panic(err)
    }

    for routes.Next() {
		route := new(Route)
        err = routes.Scan(&route.routeID, &route.name)
        if err != nil {
			panic(err)
		}
        routesList = append(routesList, route)
    }
    return routesList
}

func addDuration(storage map[int]map[string]int, routeID int, checkTime string, duration int) {
    mm, ok := storage[routeID]
    if !ok {
        mm = make(map[string]int)
        storage[routeID] = mm
    }
    mm[checkTime] = duration
}

// GetDurationsByDate returnes durations by date diff
func GetDurationsByDate(from time.Time, till time.Time) map[int]map[string]int {
	durationsMap := make(map[int]map[string]int)
    stmt, err := db.Prepare("SELECT uid, route_id, duration, check_time FROM durations where check_time between $1 and $2")
    if err != nil {
        panic(err)
    }
    durations, err := stmt.Query(from, till)
    if err != nil {
        panic(err)
    }
	for durations.Next() {
		dur := new(duration)
        err := durations.Scan(&dur.durationID, &dur.routeID, &dur.duration, &dur.checkTime)
        if err != nil {
			panic(err)
		}
        formattedCheckTime := formatTimeStamp(dur.checkTime)
        addDuration(durationsMap, dur.routeID, formattedCheckTime, dur.duration)
    }

    return durationsMap
}

// GetUniqueDurationTimestamps represents unique timestamps by dates
func GetUniqueDurationTimestamps(from time.Time, till time.Time) []string {
    timestamps := make([]string, 0)
    stmt, err := db.Prepare(`
        SELECT distinct TO_CHAR(durations.check_time, 'HH24:MI') from durations 
        where check_time between $1 and $2 order by TO_CHAR(durations.check_time, 'HH24:MI')
    `)
    if err != nil {
		panic(err)
	}
    durations, err := stmt.Query(from, till)
    if err != nil {
		panic(err)
	}
    for durations.Next() {
        var timestamp string
        err = durations.Scan(&timestamp)
        if err != nil {
			panic(err)
		}
        if contains(timestamps, timestamp) != true {
            timestamps = append(timestamps, timestamp)
        }
    }
    return timestamps
}

func buildChartRoutesMap(routes []chartRouteItem) map[int][]int {
    result := make(map[int][]int)
    for _, item := range routes {
        result[item.chartID] = append(result[item.chartID], item.routeID)
    }
    return result
}

// GetRoutesByCharts represents routes by chart ids
func GetRoutesByCharts() map[int][]int {
    routes := make([]chartRouteItem, 0)
    
    chartRoutes, err := db.Query(`
        SELECT c.uid, c.name, r.uid
        FROM charts c
        JOIN chart_routes cr on c.uid = cr.chart_id
        JOIN routes r on r.uid = cr.route_id
        ORDER BY c.uid, r.uid     
    `)
	if err != nil {
		panic(err)
	}

    for chartRoutes.Next() {
        var chartID int
        var chartName string
        var routeID int
        err = chartRoutes.Scan(&chartID, &chartName, &routeID)
        if err != nil {
			panic(err)
		}
        item := chartRouteItem{chartID, chartName, routeID}
        routes = append(routes, item)
    }
    chartRouteMap := buildChartRoutesMap(routes)
    return chartRouteMap
}