package domain

import (
	"time"

	"gorm.io/gorm"
)

type TicketStatus string

const (
	StatusActive      TicketStatus = "Active"
	StatusCancelled   TicketStatus = "Cancelled"
	StatusTransferred TicketStatus = "Transferred"
)

type Ticket struct {
	gorm.Model
	UserID       uint         `gorm:"not null" json:"user_id"`
	EventID      uint         `gorm:"not null" json:"event_id"`
	Status       TicketStatus `gorm:"type:enum('Active','Cancelled','Transferred');default:'Active';not null" json:"status"`
	PurchaseDate time.Time    `gorm:"autoCreateTime" json:"purchase_date"`
	User         User         `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Event        Event        `gorm:"foreignKey:EventID" json:"event,omitempty"`
}
