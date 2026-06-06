package main

import (
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Create an instance of the app structure
	app := NewApp()

	// Create application with options
	err := wails.Run(&options.App{
		Title:            "Калькулятор",
		Width:            670,  // Оптимальная ширина (320px калькулятор + 24px отступ + 240px история)
		Height:           580,  // Оптимальная высота под сетку кнопок
		DisableResize:    true, // Запрещаем растягивать окно, чтобы интерфейс не ломался
		Fullscreen:       false,
		Frameless:        false, // Оставляем стандартную рамку ОС (с кнопками Закрыть/Свернуть)
		BackgroundColour: &options.RGBA{R: 18, G: 18, B: 20, A: 255},
		Assets:           assets,
		OnStartup:        app.startup,
		Bind: []interface{}{
			app,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
