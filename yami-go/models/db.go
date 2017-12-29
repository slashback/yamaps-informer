package models

import (
    "fmt"
    "os"
	"database/sql"
	_ "github.com/lib/pq"
)

// DataStore db models interface
type DataStore interface {
    GetRoutes() ([]*Route, error)
    GetCharts() ([]*Chart, error)
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

var db *sql.DB
