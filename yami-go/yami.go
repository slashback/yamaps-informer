    package main

    import (
        "database/sql"
        "fmt"
        _ "github.com/lib/pq"
        "time"
    )

    const (
        DB_USER     = "postgres"
        DB_PASSWORD = "postgres"
        DB_NAME     = "routes"
    )

    // Routes route
    type Routes struct {
        routeID int
        name string
    }

    type pgChartItem struct {
        uid      int
        name     string
        routeIDS []int
    }

    func contains(s []time.Time, e time.Time) bool {
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


    func getCharts() []pgChartItem {
        chartList := make([]pgChartItem, 0)
        dbinfo := fmt.Sprintf("user=%s password=%s dbname=%s sslmode=disable",
            DB_USER, DB_PASSWORD, DB_NAME)
        db, err := sql.Open("postgres", dbinfo)
        checkErr(err)
        defer db.Close()
        charts, err := db.Query("SELECT uid, name FROM charts")
        checkErr(err)

        for charts.Next() {
            var uid int
            var name string
            routeIDS := make([]int, 0)
            err = charts.Scan(&uid, &name)
            checkErr(err)
            fmt.Println("uid | name")
            fmt.Printf("%3v | %4v \n", uid, name) 
            stmt, err := db.Prepare("SELECT route_id FROM chart_routes where chart_id=$1")
            checkErr(err)
            routes, err := stmt.Query(uid)
            checkErr(err)
            for routes.Next() {
                var routeID int
                err = routes.Scan(&routeID)
                routeIDS = append(routeIDS, routeID)
            }
            chartList = append(chartList, pgChartItem{uid, name, routeIDS})
        }
        return chartList
    }

    func getDurationsByDate(from time.Time, till time.Time) {
        dbinfo := fmt.Sprintf("user=%s password=%s dbname=%s sslmode=disable",
            DB_USER, DB_PASSWORD, DB_NAME)
        db, err := sql.Open("postgres", dbinfo)
        checkErr(err)
        defer db.Close()

        stmt, err := db.Prepare("SELECT uid, route_id, duration, check_time FROM durations where check_time between $1 and $2")
        checkErr(err)
        durations, err := stmt.Query(from, till)
        checkErr(err)
        for durations.Next() {
            var uid int
            var routeID int
            var duration string
            var checkTime time.Time
            err = durations.Scan(&uid, &routeID, &duration, &checkTime)
            fmt.Printf("%3v | %8v | %10v | %7v\n", uid, routeID, duration, checkTime)
            // routeIDS = append(routeIDS, routeID)
        }
    }

    func handleGetCharts(daysShift int) {
        charts := getCharts()
        fmt.Println(charts)
        targetDay := getDateByDaysAgo(time.Now(), daysShift)
        timeFrom := getBeginningOfTheDay(targetDay)
        timeTill := getEndOfTheDay(targetDay)
        fmt.Println(targetDay)
        fmt.Println(timeFrom)
        fmt.Println(timeTill)
        getDurationsByDate(timeFrom, timeTill)
    }

    func main() {
        handleGetCharts(7)


        // dbinfo := fmt.Sprintf("user=%s password=%s dbname=%s sslmode=disable",
        //     DB_USER, DB_PASSWORD, DB_NAME)
        // db, err := sql.Open("postgres", dbinfo)
        // checkErr(err)
        // defer db.Close()


        // timestamps := make([]time.Time, 0)


        // routes := getRoutes()
        // for _, route := range routes {
        //     fmt.Println(route)

        //     stmt, err := db.Prepare("SELECT uid, route_id, duration, check_time FROM durations where route_id=$1")
        //     checkErr(err)
        //     rows, err := stmt.Query(route.routeID)
        //     checkErr(err)
        //     for rows.Next() {
        //         var uid int
        //         var routeID int
        //         var duration string
        //         var checkTime time.Time
        //         err = rows.Scan(&uid, &routeID, &duration, &checkTime)
        //         checkErr(err)
        //         fmt.Println("uid | username | department | created ")
        //         fmt.Printf("%3v | %8v | %10v | %7v\n", uid, routeID, duration, checkTime)
        //         if contains(timestamps, checkTime) != true {
        //             fmt.Println("NOT CONT")
        //             timestamps = append(timestamps, checkTime)
        //         }
        //     }
        // }
        // fmt.Println(timestamps)
    }

    func checkErr(err error) {
        if err != nil {
            panic(err)
        }
    }

    func getRoutes() []Routes {
        routesList := make([]Routes, 0)
        dbinfo := fmt.Sprintf("user=%s password=%s dbname=%s sslmode=disable",
            DB_USER, DB_PASSWORD, DB_NAME)
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
            fmt.Println("uid | name")
            fmt.Printf("%3v | %4v \n", uid, name) 
            routesList = append(routesList, Routes{uid, name})
        }
        return routesList
    }