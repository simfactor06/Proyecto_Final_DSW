package dao

import (
	"github.com/proyecto-final/ticketek/domain"
)

func CreateUser(user *domain.User) error {
	return DB.Create(user).Error
}

func GetUserByEmail(email string) (*domain.User, error) {
	var user domain.User
	if err := DB.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func GetUserByID(id uint) (*domain.User, error) {
	var user domain.User
	if err := DB.First(&user, id).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func GetUserByDNI(dni string) (*domain.User, error) {
	var user domain.User
	if err := DB.Where("dni = ?", dni).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}
