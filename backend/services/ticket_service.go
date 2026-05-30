package services

import (
	"errors"

	"github.com/proyecto-final/ticketek/dao"
	"github.com/proyecto-final/ticketek/domain"
)

type PurchaseInput struct {
	EventID uint `json:"event_id" binding:"required"`
}

type TransferInput struct {
	TargetEmail string `json:"target_email" binding:"required,email"`
}

func PurchaseTicket(userID uint, input PurchaseInput) (*domain.Ticket, error) {
	event, err := dao.GetEventByID(input.EventID)
	if err != nil {
		return nil, errors.New("event not found")
	}
	if event.AvailableSpots <= 0 {
		return nil, errors.New("no available spots for this event")
	}

	ticket := &domain.Ticket{
		UserID:  userID,
		EventID: input.EventID,
		Status:  domain.StatusActive,
	}
	if err := dao.CreateTicket(ticket); err != nil {
		return nil, err
	}
	if err := dao.DecrementAvailableSpots(input.EventID); err != nil {
		return nil, err
	}
	return ticket, nil
}

func GetMyTickets(userID uint) ([]domain.Ticket, error) {
	return dao.GetTicketsByUserID(userID)
}

func CancelTicket(ticketID, userID uint) error {
	ticket, err := dao.GetTicketByID(ticketID)
	if err != nil {
		return errors.New("ticket not found")
	}
	if ticket.UserID != userID {
		return errors.New("unauthorized: ticket does not belong to you")
	}
	if ticket.Status != domain.StatusActive {
		return errors.New("only active tickets can be cancelled")
	}
	ticket.Status = domain.StatusCancelled
	if err := dao.UpdateTicket(ticket); err != nil {
		return err
	}
	return dao.IncrementAvailableSpots(ticket.EventID)
}

func TransferTicket(ticketID, userID uint, input TransferInput) error {
	ticket, err := dao.GetTicketByID(ticketID)
	if err != nil {
		return errors.New("ticket not found")
	}
	if ticket.UserID != userID {
		return errors.New("unauthorized: ticket does not belong to you")
	}
	if ticket.Status != domain.StatusActive {
		return errors.New("only active tickets can be transferred")
	}
	target, err := dao.GetUserByEmail(input.TargetEmail)
	if err != nil {
		return errors.New("target user not found")
	}
	if target.ID == userID {
		return errors.New("cannot transfer ticket to yourself")
	}
	ticket.Status = domain.StatusTransferred
	if err := dao.UpdateTicket(ticket); err != nil {
		return err
	}

	newTicket := &domain.Ticket{
		UserID:  target.ID,
		EventID: ticket.EventID,
		Status:  domain.StatusActive,
	}
	return dao.CreateTicket(newTicket)
}
