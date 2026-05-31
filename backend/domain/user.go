package domain

import "gorm.io/gorm"

type Role string

const (
	RoleClient        Role = "Client"
	RoleAdministrator Role = "Administrator"
)

type User struct {
	gorm.Model
	Name         string `gorm:"type:varchar(100);not null" json:"name"`
	Email        string `gorm:"type:varchar(150);uniqueIndex;not null" json:"email"`
	PasswordHash string `gorm:"type:varchar(255);not null" json:"-"`
	Role         Role   `gorm:"type:enum('Client','Administrator');default:'Client';not null" json:"role"`
	DNI          string `gorm:"type:varchar(20)" json:"dni"`
}
