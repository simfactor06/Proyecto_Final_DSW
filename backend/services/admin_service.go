package services

import (
	"errors"

	"github.com/proyecto-final/ticketek/dao"
)

type EventReport struct {
	EventID        uint        `json:"event_id"`
	Title          string      `json:"title"`
	Capacity       int         `json:"capacity"`
	AvailableSpots int         `json:"available_spots"`
	SoldTickets    int64       `json:"sold_tickets"`
	OccupancyRate  float64     `json:"occupancy_rate"`
	Buyers         interface{} `json:"buyers"`
}

func GetEventReport(eventID uint) (*EventReport, error) {
	event, err := dao.GetEventByID(eventID)
	if err != nil {
		return nil, errors.New("event not found")
	}
	sold, err := dao.CountSoldTicketsByEvent(eventID)
	if err != nil {
		return nil, err
	}
	buyers, err := dao.GetTicketsByEventID(eventID)
	if err != nil {
		return nil, err
	}
	occupancy := 0.0
	if event.Capacity > 0 {
		occupancy = float64(sold) / float64(event.Capacity) * 100
	}
	return &EventReport{
		EventID:        eventID,
		Title:          event.Title,
		Capacity:       event.Capacity,
		AvailableSpots: event.AvailableSpots,
		SoldTickets:    sold,
		OccupancyRate:  occupancy,
		Buyers:         buyers,
	}, nil
}
