package models

import "time"

// Route route
type Route struct {
	RouteID     int    `json:"uid"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Waypoints   string `json:"waypoints"`
}

//Chart chart
type Chart struct {
	UID         int    `json:"uid"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Routes      string `json:"routes"`
}

// ChartData chart data from api
type ChartData struct {
	UID         int    `json:"uid"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Routes      []int  `json:"routes"`
}

// Duration represents duration item in db
type Duration struct {
	DurationID int
	RouteID    int
	Duration   int
	CheckTime  time.Time
}

type chartRouteItem struct {
	chartID   int
	chartName string
	routeID   int
}

// AuthData auth data
type AuthData struct {
	Login string `json:"login"`
	Password string `json:"password"`
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
func (db *DB) GetRoutes() ([]*Route, error) {
	routesList := make([]*Route, 0)
	routes, err := db.Query("SELECT uid, name, waypoints FROM routes")
	defer routes.Close()
	if err != nil {
		return nil, err
	}

	for routes.Next() {
		route := new(Route)
		err = routes.Scan(&route.RouteID, &route.Name, &route.Waypoints)
		if err != nil {
			return nil, err
		}
		routesList = append(routesList, route)
	}
	return routesList, nil
}

// GetCharts get charts from db
func (db *DB) GetCharts() ([]*Chart, error) {
	chartList := make([]*Chart, 0)
	charts, err := db.Query(`
        select c.uid, c.name, array_to_json(array_agg(cr.route_id)) 
        from charts c 
        join chart_routes cr on c.uid = cr.chart_id 
        group by c.uid, c.name  
    `)
	defer charts.Close()
	if err != nil {
        return nil, err
	}

	for charts.Next() {
		chart := new(Chart)
		err = charts.Scan(&chart.UID, &chart.Name, &chart.Routes)
		if err != nil {
			return nil, err
		}
		chartList = append(chartList, chart)
	}
	return chartList, nil
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
func (db *DB) GetDurationsByDate(from time.Time, till time.Time) map[int]map[string]int {
	durationsMap := make(map[int]map[string]int)
	stmt, err := db.Prepare(`
		SELECT uid, route_id, duration, check_time 
		FROM durations 
		WHERE check_time between $1 and $2
	`)
	if err != nil {
		panic(err)
	}
	durations, err := stmt.Query(from, till)
	if err != nil {
		panic(err)
	}
	for durations.Next() {
		dur := new(Duration)
		err := durations.Scan(&dur.DurationID, &dur.RouteID, &dur.Duration, &dur.CheckTime)
		if err != nil {
			panic(err)
		}
		formattedCheckTime := formatTimeStamp(dur.CheckTime)
		addDuration(durationsMap, dur.RouteID, formattedCheckTime, dur.Duration)
	}

	return durationsMap
}

// GetUniqueDurationTimestamps represents unique timestamps by dates
func (db *DB) GetUniqueDurationTimestamps(from time.Time, till time.Time) []string {
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
func (db *DB) GetRoutesByCharts() map[int][]int {
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

// AddDuration add duration to db
func AddDuration(dur Duration) {
	stmt, err := db.Prepare("INSERT INTO durations(route_id, duration, check_time) VALUES($1,$2,$3)")
	if err != nil {
		panic(err)
	}

	_, err = stmt.Exec(dur.RouteID, dur.Duration, dur.CheckTime)
	if err != nil {
		panic(err)
	}
}

// UpdateRoute updates route
func (db *DB) UpdateRoute(route Route) (int, error) {
	stmt, err := db.Prepare(`
        UPDATE routes
        SET name=$1, waypoints=$2 
        WHERE uid=$3
    `)
	if err != nil {
		return 0, err
	}
	_, err = stmt.Exec(route.Name, route.Waypoints, route.RouteID)
	if err != nil {
		return 0, err
	}
	return route.RouteID, nil
}

// AddRoute adds route
func (db *DB) AddRoute(route Route) (int, error) {
	stmt := `
        INSERT INTO routes (name, description, waypoints)
        VALUES ($1, 'desc', $2) 
        returning uid
    `
	id := 0
	err := db.QueryRow(stmt, route.Name, route.Waypoints).Scan(&id)
	if err != nil {
		return 0, err
	}
	return id, nil
}

func (db *DB) addChartRoute(chartID int, routeID int) error {
	stmt := `
        INSERT INTO chart_routes (chart_id, route_id)
        VALUES ($1, $2)
    `
	_, err := db.Query(stmt, chartID, routeID)
	if err != nil {
		return err
	}
	return nil
}

func (db *DB) removeChart(chartID int) error {
	stmt := `
        DELETE from charts
        WHERE uid=$1
    `
	_, err := db.Query(stmt, chartID)
	if err != nil {
		return err
	}
	return nil
}

func (db *DB) removeRoute(routeID int) error {
	stmt := `
        DELETE from routes
        WHERE uid=$1
    `
	_, err := db.Query(stmt, routeID)
	if err != nil {
		return err
	}
	return nil
}

func (db *DB) removeRouteFromCharts(routeID int) error {
	stmt := `
        DELETE from chart_routes
        WHERE route_id=$1
    `
	_, err := db.Query(stmt, routeID)
	if err != nil {
		return err
	}
	return nil
}

func (db * DB) removeRouteDurations(routeID int) error {
	stmt := `
        DELETE from durations
        WHERE route_id=$1
    `
	_, err := db.Query(stmt, routeID)
	if err != nil {
        return err
	}
	return nil
}

// RemoveRoute removes route
func (db *DB) RemoveRoute(routeID int) error {
	err := db.removeRouteDurations(routeID)
	if err != nil {
		return err
	}
	err = db.removeRouteFromCharts(routeID)
	if err != nil {
		return err
	}
	err = db.removeRoute(routeID)
	if err != nil {
		return err
	}
	return nil
}

// RemoveChart removes chart
func (db *DB) RemoveChart(chartID int) error {
	err := db.removeChartRoutes(chartID)
	if err != nil {
		return err
	}
	err = db.removeChart(chartID)
	if err != nil {
		return err
	}
	return nil
}

func (db *DB) removeChartRoutes(chartID int) error {
	stmt := `
        DELETE from chart_routes
        WHERE chart_id=$1
    `
	_, err := db.Query(stmt, chartID)
	if err != nil {
		return err
	}
	return nil
}

// AddChart adds chart
func (db *DB) AddChart(chart ChartData) (int, error) {
	stmt := `
        INSERT INTO charts (name)
        VALUES ($1) 
        returning uid
    `
	chartID := 0
	err := db.QueryRow(stmt, chart.Name).Scan(&chartID)
	if err != nil {
		return 0, err
	}
	for _, routeID := range chart.Routes {
		db.addChartRoute(chartID, routeID)
	}
	return chartID, nil
}

// UpdateChart updates chart
func (db *DB) UpdateChart(chart ChartData) (int, error) {
	stmt := `
        UPDATE charts
        SET name = $1 
        WHERE uid = $2
    `
	_, err := db.Query(stmt, chart.Name, chart.UID)
	if err != nil {
		return 0, err
	}
	err = db.removeChartRoutes(chart.UID)
	if err != nil {
		return 0, err
	}
	for _, routeID := range chart.Routes {
		db.addChartRoute(chart.UID, routeID)
	}
	return chart.UID, nil
}

// IsSuperUser is superuser
func (db *DB) IsSuperUser(authData AuthData) (bool, error) {
	stmt, err := db.Prepare(`
		SELECT login, password
		FROM users
		WHERE login=$1 and password=$2
    `)
	if err != nil {
		return false, err
	}
	users, err := stmt.Query(authData.Login, authData.Password)
	if err != nil {
		return false, err
	}
	for users.Next() {
		return true, nil
	}
	return false, nil
}
