package main

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/proyecto-final/ticketek/controllers"
	"github.com/proyecto-final/ticketek/dao"
	"github.com/proyecto-final/ticketek/utils"
)

func main() {
	os.MkdirAll("uploads", 0755)
	dao.InitDB()

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	r.Static("/uploads", "./uploads")

	api := r.Group("/api")
	{
		// Auth
		auth := api.Group("/auth")
		{
			auth.POST("/register", controllers.Register)
			auth.POST("/login", controllers.Login)
		}

		// Public event endpoints
		events := api.Group("/events")
		{
			events.GET("", controllers.GetEvents)
			events.GET("/:id", controllers.GetEvent)
		}

		// Protected client endpoints
		tickets := api.Group("/tickets")
		tickets.Use(utils.AuthMiddleware())
		{
			tickets.POST("/purchase", controllers.PurchaseTicket)
			tickets.GET("/my-tickets", controllers.GetMyTickets)
			tickets.POST("/:id/cancel", controllers.CancelTicket)
			tickets.POST("/:id/transfer", controllers.TransferTicket)
		}

		// Admin endpoints
		admin := api.Group("/admin")
		admin.Use(utils.AuthMiddleware(), utils.AdminMiddleware())
		{
			admin.POST("/events", controllers.AdminCreateEvent)
			admin.PUT("/events/:id", controllers.AdminUpdateEvent)
			admin.DELETE("/events/:id", controllers.AdminDeleteEvent)
			admin.GET("/events/:id/report", controllers.AdminGetEventReport)
			admin.POST("/upload", controllers.UploadImage)
		}
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
