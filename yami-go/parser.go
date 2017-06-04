package main

import (
	"os/exec"
	"fmt"
	"database/sql"
    _ "github.com/lib/pq"
	"encoding/json"
	"strconv"
)

const (
    dbUser     = "postgres"
    dbPassword = "postgres"
    dbName     = "routes"
)

func checkErr(err error) {
    if err != nil {
        panic(err)
    }
}

type durationResult struct {
	Time string `json:"time"`
}

func getDuration(waypoints string) string {
	fmt.Println(waypoints)
	staticDir := "/opt/projects/yamaps-informer/yami/static/parser/"
	cmd := exec.Command(
		"phantomjs",
		fmt.Sprintf("%sgrab.js", staticDir),
		fmt.Sprintf("%sindex_parser.html", staticDir),
		"[[55.90883,37.711122], [55.9124, 37.716707], [55.886758, 37.661844]]")
	output, err := cmd.CombinedOutput()
	if err != nil {
		fmt.Println(fmt.Sprint(err) + ": " + string(output))
		checkErr(err)
	}
	// output := `{"time":"1143.56"}`
	res := durationResult{}
	json.Unmarshal([]byte(output), &res)
	timeStr, err := strconv.ParseFloat(res.Time, 64)
	checkErr(err)
	fmt.Println(int(timeStr / 60))
	return "foo"
}

type route struct {
	routeID int
	waypoints string
}

func getRouteWaypoints() []route{
	waypointsList := make([]route, 0)
	dbinfo := fmt.Sprintf("user=%s password=%s dbname=%s sslmode=disable",
        dbUser, dbPassword, dbName)
    db, err := sql.Open("postgres", dbinfo)
    checkErr(err)
    defer db.Close()
    routes, err := db.Query("SELECT uid, waypoints FROM routes")
    checkErr(err)
	for routes.Next() {
		var routeID int
		var waypoints string
		err := routes.Scan(&routeID, &waypoints)
		checkErr(err)
		routeItem := route{routeID, waypoints}
		waypointsList = append(waypointsList, routeItem)
	}
	return waypointsList
}

func main() {
	routesList := getRouteWaypoints()
	for _, route := range routesList {
		duration := getDuration(route.waypoints)
		fmt.Sprintf(duration)
	}
}