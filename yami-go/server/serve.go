package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"regexp"
	"strconv"
	"time"

	"../models"
)

// Env datastore model
type Env struct {
	db models.DataStore
}

type chartLine struct {
	RouteID    int
	RouteName  string `json:"name"`
	Timestamps []int  `json:"values"`
}

type chart struct {
	Data   []chartLine `json:"data"`
	Labels []string    `json:"labels"`
}

type chartList struct {
	ChartList []chart `json:"chart_list"`
}

type sessionToken struct {
	Token string `json:"token"`
}

// AuthData stores admin password
type AuthData struct {
	Password string `json:"password"`
}

type responseUID struct {
	UID int `json:"uid"`
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

func remapDurations(rawDurations map[int]map[string]int, timestamps *[]string, routes []*models.Route, chartRoutes map[int][]int) chartList {
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

func (env *Env) getDurationsByDate(from time.Time, till time.Time) chartList {
	timestamps := env.db.GetUniqueDurationTimestamps(from, till)
	durationsMap := env.db.GetDurationsByDate(from, till)
	routes, err := env.db.GetRoutes()
	if err != nil {
		panic(err)
	}
	routeCharts := env.db.GetRoutesByCharts()

	return remapDurations(durationsMap, &timestamps, routes, routeCharts)
}

func (env *Env) handleGetCharts(daysShift int) chartList {
	targetDay := getDateByDaysAgo(time.Now(), daysShift)
	timeFrom := getBeginningOfTheDay(targetDay)
	timeTill := getEndOfTheDay(targetDay)
	charts := env.getDurationsByDate(timeFrom, timeTill)
	return charts
}

func getDaysShiftFromRequest(r *http.Request) int {
	daysShiftRegex := regexp.MustCompile(`\d+$`)
	regexResult := daysShiftRegex.FindStringSubmatch(r.RequestURI)
	if len(regexResult) == 0 {
		return 0
	}
	match := daysShiftRegex.FindStringSubmatch(r.RequestURI)[0]
	daysShift, err := strconv.Atoi(match)
	if err != nil {
		fmt.Println(err)
	}
	return daysShift
}

func (env *Env) getChartsHandler(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	daysShift := getDaysShiftFromRequest(r)
	charts := env.handleGetCharts(daysShift)
	chartJSON, _ := json.Marshal(charts)
	elapsed := time.Since(start)
	fmt.Printf("took %s\n", elapsed)
	w.Header().Set("Content-Type", "application/json")
	fmt.Fprintf(w, string(chartJSON))
}

func (env *Env) chartListHandler(w http.ResponseWriter, r *http.Request) {
	charts, err := env.db.GetCharts()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	chartJSON, err := json.Marshal(charts)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(chartJSON)
}

func (env *Env) getRoutesHandler(w http.ResponseWriter, r *http.Request) {
	routes, err := env.db.GetRoutes()
	if err != nil {
		panic(err)
	}
	routesJSON, err := json.Marshal(routes)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(routesJSON)
}

func (env *Env) removeChartHandler(w http.ResponseWriter, r *http.Request) {
    chart, err := getChartFromRequest(r)
    if err != nil {
		http.Error(w, "ValidationError", http.StatusInternalServerError)
		return
    }
	err = env.db.RemoveChart(chart.UID)
	if err != nil {
		panic(err)
	}
	responseID(w, chart.UID)
}

func (env *Env) removeRouteHandler(w http.ResponseWriter, r *http.Request) {
	route, err := getRouteFromRequest(r)
	if err != nil {
		http.Error(w, "ValidationError", http.StatusInternalServerError)
		return
    }
	err = env.db.RemoveRoute(route.RouteID)
	if err != nil {
		panic(err)
	}
	responseID(w, route.RouteID)
}

func responseID(w http.ResponseWriter, uid int) {
	resp := responseUID{uid}
	js, err := json.Marshal(resp)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(js)
}

func getChartFromRequest(r *http.Request) (models.ChartData, error) {
	decoder := json.NewDecoder(r.Body)
	var chartData models.ChartData
	err := decoder.Decode(&chartData)
	if err != nil {
		return models.ChartData{}, err
	}
	return chartData, nil
}

func (env *Env) chartUpdateHandler(w http.ResponseWriter, r *http.Request) {
	chart, err := getChartFromRequest(r)
	var uid int
	if chart.UID != 0 {
		fmt.Printf("Updating chartID: %d, name: %s \n", chart.UID, chart.Name)
		uid, err = env.db.UpdateChart(chart)
	} else {
		fmt.Printf("Creating new chart: %s \n", chart.Name)
		uid, err = env.db.AddChart(chart)
	}
	if err != nil {
		panic(err)
	}
	responseID(w, uid)
}

func getRouteFromRequest(r *http.Request) (models.Route, error) {
	decoder := json.NewDecoder(r.Body)
	var routeData models.Route
	err := decoder.Decode(&routeData)
	if err != nil {
		return models.Route{}, err
	}
	return routeData, nil
}

func (env *Env) routeUpdateHandler(w http.ResponseWriter, r *http.Request) {
	route, err := getRouteFromRequest(r)
	if err != nil {
		panic(err)
	}
	var uid int
	if route.RouteID != 0 {
		fmt.Printf("Updating routeID: %d, name: %s \n", route.RouteID, route.Name)
		uid, err = env.db.UpdateRoute(route)
	} else {
		fmt.Printf("Creating new route: %s \n", route.Name)
		uid, err = env.db.AddRoute(route)
	}
	if err != nil {
		panic(err)
	}
	responseID(w, uid)
}

func getAuthDataFromRequest(r *http.Request) (models.AuthData, error) {
	decoder := json.NewDecoder(r.Body)
	var authData models.AuthData
	err := decoder.Decode(&authData)
	if err != nil {
		return models.AuthData{}, err
	}
	return authData, nil
}

func responseAuthToken(w http.ResponseWriter, token string) {
	resp := sessionToken{token}
	js, err := json.Marshal(resp)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(js)
}

func (env *Env) getSessionHandler(w http.ResponseWriter, r *http.Request) {
	authData, err := getAuthDataFromRequest(r)
	if err != nil {
		http.Error(w, "ValidationError", http.StatusInternalServerError)
		return
	}
	authentificated, err := env.db.IsSuperUser(authData)
	if err != nil {
		panic(err)
	}
	if authentificated == true {
		responseAuthToken(w, "wabwabwab")
	} else {
		http.Error(w, "AuthentificationError", http.StatusForbidden)
		return
	}
}

func main() {
	db, err := models.InitDB()
	if err != nil {
		panic(err)
	}
	env := &Env{db}

	http.HandleFunc("/api/build-charts/", env.getChartsHandler)
	http.HandleFunc("/api/get-charts/", env.chartListHandler)
	http.HandleFunc("/api/get-routes/", env.getRoutesHandler)
	http.HandleFunc("/api/update-chart/", env.chartUpdateHandler)
	http.HandleFunc("/api/update-route/", env.routeUpdateHandler)
	http.HandleFunc("/api/remove-chart/", env.removeChartHandler)
	http.HandleFunc("/api/remove-route/", env.removeRouteHandler)
	http.HandleFunc("/api/get-session/", env.getSessionHandler)
	http.ListenAndServe(":8080", nil)
}
