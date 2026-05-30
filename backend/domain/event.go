package domain

import "gorm.io/gorm"

type Event struct {
	gorm.Model
	Title          string  `gorm:"type:varchar(200);not null" json:"title"`
	Description    string  `gorm:"type:text" json:"description"`
	Category       string  `gorm:"type:varchar(50)" json:"category"`
	EventDate      string  `gorm:"type:date;not null" json:"event_date"`
	EventTime      string  `gorm:"type:varchar(8);not null" json:"event_time"`
	Duration       int     `gorm:"type:int" json:"duration"`
	Capacity       int     `gorm:"type:int;not null" json:"capacity"`
	AvailableSpots int     `gorm:"type:int;not null" json:"available_spots"`
	ImageURL       string  `gorm:"type:varchar(255)" json:"image_url"`
	Price          float64 `gorm:"type:decimal(10,2);default:0" json:"price"`
}
