package models

import (
    "fmt"
    "os"
	"database/sql"
	_ "github.com/lib/pq"
)

// DataStore db models interface
type DataStore interface {
    AddChart(chart ChartData) (int, error)
    AddRoute(route Route) (int, error)
    GetRoutes() ([]*Route, error)
    GetCharts() ([]*Chart, error)
    UpdateChart(chart ChartData) (int, error)
    UpdateRoute(route Route) (int, error)
    RemoveRoute(routeID int) error
    RemoveChart(chartID int) error
}

// DB model structure
type DB struct {
	*sql.DB
}

// InitDB init DB connetion
func InitDB() (*DB, error) {
    dbUser := os.Getenv("PG_APP_USER")
    dbPass := os.Getenv("PG_APP_PASS")
    const dbName = "routes"
    dataSourceName := fmt.Sprintf("postgres://%s:%s@localhost/%s?sslmode=disable", dbUser, dbPass, dbName)
	db, err := sql.Open("postgres", dataSourceName)
    if err != nil {
        return nil, err
    }
    if err = db.Ping(); err != nil {
        return nil, err
    }
    return &DB{db}, nil
}

// Deprecated
var db *sql.DB
