package dao

import (
	"github.com/proyecto-final/ticketek/domain"
)

func GetAllEvents(category, search string) ([]domain.Event, error) {
	var events []domain.Event
	query := DB.Model(&domain.Event{})
	if category != "" {
		query = query.Where("category = ?", category)
	}
	if search != "" {
		query = query.Where("title LIKE ?", "%"+search+"%")
	}
	if err := query.Find(&events).Error; err != nil {
		return nil, err
	}
	return events, nil
}

func GetEventByID(id uint) (*domain.Event, error) {
	var event domain.Event
	if err := DB.First(&event, id).Error; err != nil {
		return nil, err
	}
	return &event, nil
}

func CreateEvent(event *domain.Event) error {
	return DB.Create(event).Error
}

func UpdateEvent(event *domain.Event) error {
	return DB.Save(event).Error
}

func DeleteEvent(id uint) error {
	return DB.Delete(&domain.Event{}, id).Error
}

func DecrementAvailableSpots(eventID uint) error {
	return DB.Model(&domain.Event{}).Where("id = ? AND available_spots > 0", eventID).
		UpdateColumn("available_spots", DB.Raw("available_spots - 1")).Error
}

func DecrementAvailableSpotsByN(eventID uint, n int) error {
	return DB.Model(&domain.Event{}).Where("id = ? AND available_spots >= ?", eventID, n).
		UpdateColumn("available_spots", DB.Raw("available_spots - ?", n)).Error
}

func IncrementAvailableSpots(eventID uint) error {
	return DB.Model(&domain.Event{}).Where("id = ?", eventID).
		UpdateColumn("available_spots", DB.Raw("available_spots + 1")).Error
}
