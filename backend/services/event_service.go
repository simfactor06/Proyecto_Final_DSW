package services

import (
	"errors"

	"github.com/proyecto-final/ticketek/dao"
	"github.com/proyecto-final/ticketek/domain"
)

type CreateEventInput struct {
	Title          string  `json:"title" binding:"required"`
	Description    string  `json:"description"`
	Category       string  `json:"category"`
	EventDate      string  `json:"event_date" binding:"required"`
	EventTime      string  `json:"event_time" binding:"required"`
	Duration       int     `json:"duration"`
	Capacity       int     `json:"capacity" binding:"required,min=1"`
	ImageURL       string  `json:"image_url"`
	Price          float64 `json:"price"`
}

type UpdateEventInput struct {
	Title       *string  `json:"title"`
	Description *string  `json:"description"`
	Category    *string  `json:"category"`
	EventDate   *string  `json:"event_date"`
	EventTime   *string  `json:"event_time"`
	Duration    *int     `json:"duration"`
	Capacity    *int     `json:"capacity"`
	ImageURL    *string  `json:"image_url"`
	Price       *float64 `json:"price"`
}

func GetAllEvents(category, search string) ([]domain.Event, error) {
	return dao.GetAllEvents(category, search)
}

func GetEventByID(id uint) (*domain.Event, error) {
	event, err := dao.GetEventByID(id)
	if err != nil {
		return nil, errors.New("event not found")
	}
	return event, nil
}

func CreateEvent(input CreateEventInput) (*domain.Event, error) {
	event := &domain.Event{
		Title:          input.Title,
		Description:    input.Description,
		Category:       input.Category,
		EventDate:      input.EventDate,
		EventTime:      input.EventTime,
		Duration:       input.Duration,
		Capacity:       input.Capacity,
		AvailableSpots: input.Capacity,
		ImageURL:       input.ImageURL,
		Price:          input.Price,
	}
	if err := dao.CreateEvent(event); err != nil {
		return nil, err
	}
	return event, nil
}

func UpdateEvent(id uint, input UpdateEventInput) (*domain.Event, error) {
	event, err := dao.GetEventByID(id)
	if err != nil {
		return nil, errors.New("event not found")
	}
	if input.Title != nil {
		event.Title = *input.Title
	}
	if input.Description != nil {
		event.Description = *input.Description
	}
	if input.Category != nil {
		event.Category = *input.Category
	}
	if input.EventDate != nil {
		event.EventDate = *input.EventDate
	}
	if input.EventTime != nil {
		event.EventTime = *input.EventTime
	}
	if input.Duration != nil {
		event.Duration = *input.Duration
	}
	if input.Capacity != nil {
		diff := *input.Capacity - event.Capacity
		event.Capacity = *input.Capacity
		event.AvailableSpots += diff
		if event.AvailableSpots < 0 {
			event.AvailableSpots = 0
		}
	}
	if input.ImageURL != nil {
		event.ImageURL = *input.ImageURL
	}
	if input.Price != nil {
		event.Price = *input.Price
	}
	if err := dao.UpdateEvent(event); err != nil {
		return nil, err
	}
	return event, nil
}

func DeleteEvent(id uint) error {
	_, err := dao.GetEventByID(id)
	if err != nil {
		return errors.New("event not found")
	}
	return dao.DeleteEvent(id)
}
