package dao

import (
	"github.com/proyecto-final/ticketek/domain"
)

func CreateTicket(ticket *domain.Ticket) error {
	return DB.Create(ticket).Error
}

func GetTicketsByUserID(userID uint) ([]domain.Ticket, error) {
	var tickets []domain.Ticket
	if err := DB.Preload("Event").Where("user_id = ?", userID).Find(&tickets).Error; err != nil {
		return nil, err
	}
	return tickets, nil
}

func GetTicketByID(id uint) (*domain.Ticket, error) {
	var ticket domain.Ticket
	if err := DB.Preload("Event").Preload("User").First(&ticket, id).Error; err != nil {
		return nil, err
	}
	return &ticket, nil
}

func UpdateTicket(ticket *domain.Ticket) error {
	return DB.Save(ticket).Error
}

func GetTicketsByEventID(eventID uint) ([]domain.Ticket, error) {
	var tickets []domain.Ticket
	if err := DB.Preload("User").Where("event_id = ? AND status = ?", eventID, domain.StatusActive).Find(&tickets).Error; err != nil {
		return nil, err
	}
	return tickets, nil
}

func CountSoldTicketsByEvent(eventID uint) (int64, error) {
	var count int64
	err := DB.Model(&domain.Ticket{}).
		Where("event_id = ? AND status != ?", eventID, domain.StatusCancelled).
		Count(&count).Error
	return count, err
}
