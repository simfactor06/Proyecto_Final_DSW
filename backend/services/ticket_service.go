package services

import (
	"errors"

	"github.com/proyecto-final/ticketek/dao"
	"github.com/proyecto-final/ticketek/domain"
)

type PurchaseInput struct {
	EventID  uint `json:"event_id" binding:"required"`
	Quantity int  `json:"quantity"`
}

type TransferInput struct {
	TargetDNI string `json:"target_dni" binding:"required"`
}

func PurchaseTicket(userID uint, input PurchaseInput) ([]domain.Ticket, error) {
	qty := input.Quantity
	if qty < 1 {
		qty = 1
	}
	if qty > 10 {
		return nil, errors.New("no se pueden comprar más de 10 entradas a la vez")
	}

	event, err := dao.GetEventByID(input.EventID)
	if err != nil {
		return nil, errors.New("event not found")
	}
	if event.AvailableSpots < qty {
		return nil, errors.New("no hay suficientes lugares disponibles")
	}

	var tickets []domain.Ticket
	for i := 0; i < qty; i++ {
		t := &domain.Ticket{
			UserID:  userID,
			EventID: input.EventID,
			Status:  domain.StatusActive,
		}
		if err := dao.CreateTicket(t); err != nil {
			return nil, err
		}
		tickets = append(tickets, *t)
	}

	if err := dao.DecrementAvailableSpotsByN(input.EventID, qty); err != nil {
		return nil, err
	}
	return tickets, nil
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
	target, err := dao.GetUserByDNI(input.TargetDNI)
	if err != nil {
		return errors.New("no se encontró un usuario con ese DNI")
	}
	if target.ID == userID {
		return errors.New("no podés transferirte una entrada a vos mismo")
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
