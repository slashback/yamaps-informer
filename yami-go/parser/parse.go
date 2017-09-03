package main

import (
	"os"
	"os/exec"
	"fmt"
        "log"
	"bytes"
	"encoding/json"
	"strconv"
	"time"
	"../models"
)

func checkErr(err error) {
    if err != nil {
        panic(err)
    }
}

type durationResult struct {
	Time string `json:"time"`
}

func getDuration(waypoints string) int {
	staticDir := "/opt/projects/yamaps-informer/yami/static/parser/"
	cmd := exec.Command(
		"phantomjs",
		fmt.Sprintf("%sgrab.js", staticDir),
		fmt.Sprintf("%sindex_parser.html", staticDir),
		waypoints)
	var out bytes.Buffer
	var stderr bytes.Buffer
	cmd.Stdout = &out
	cmd.Stderr = &stderr
	err := cmd.Run()
	if err != nil {
		fmt.Println(fmt.Sprint(err) + ": " + stderr.String())
		return 0
	}
	output :=  out.String()
	res := durationResult{}
	json.Unmarshal([]byte(output), &res)
	timeStr, err := strconv.ParseFloat(res.Time, 64)
	checkErr(err)
	formatted := int(timeStr / 60)
	return formatted
}

func main() {
	dbUser := os.Getenv("PG_APP_USER")
    dbPass := os.Getenv("PG_APP_PASS")
    const dbName = "routes"
    dbinfo := fmt.Sprintf("postgres://%s:%s@localhost/%s", dbUser, dbPass, dbName)
    models.InitDB(dbinfo)
	routesList := models.GetRoutes()
	checkTime := time.Now()
	for _, r := range routesList {
		route := *r
		duration := getDuration(route.Waypoints)
		durationItem := models.Duration{RouteID: route.RouteID, CheckTime: checkTime, Duration: duration}
		models.AddDuration(durationItem)
		log.Printf("Route %s: %d\n", route.Name, duration)
	}
}
