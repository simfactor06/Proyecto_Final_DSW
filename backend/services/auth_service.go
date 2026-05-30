package services

import (
	"errors"

	"github.com/proyecto-final/ticketek/dao"
	"github.com/proyecto-final/ticketek/domain"
	"github.com/proyecto-final/ticketek/utils"
)

type RegisterInput struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type AuthResponse struct {
	Token string      `json:"token"`
	User  domain.User `json:"user"`
}

func Register(input RegisterInput) (*AuthResponse, error) {
	existing, _ := dao.GetUserByEmail(input.Email)
	if existing != nil {
		return nil, errors.New("email already registered")
	}
	user := &domain.User{
		Name:         input.Name,
		Email:        input.Email,
		PasswordHash: utils.HashPassword(input.Password),
		Role:         domain.RoleClient,
	}
	if err := dao.CreateUser(user); err != nil {
		return nil, err
	}
	token, err := utils.GenerateToken(user.ID, user.Role)
	if err != nil {
		return nil, err
	}
	return &AuthResponse{Token: token, User: *user}, nil
}

func Login(input LoginInput) (*AuthResponse, error) {
	user, err := dao.GetUserByEmail(input.Email)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}
	if !utils.CheckPassword(input.Password, user.PasswordHash) {
		return nil, errors.New("invalid credentials")
	}
	token, err := utils.GenerateToken(user.ID, user.Role)
	if err != nil {
		return nil, err
	}
	return &AuthResponse{Token: token, User: *user}, nil
}
