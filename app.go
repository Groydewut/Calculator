package main

import (
	"context"
	"fmt"
)

// App struct
type App struct {
	ctx  context.Context
	calc *Calculator
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{
		calc: NewCalculator(),
	}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	fmt.Println("Приложение запущено! История загружена.")
}

func (a *App) domReady(ctx context.Context) {}

func (a *App) beforeClose(ctx context.Context) (prevent bool) {
	return false
}

func (a *App) shutdown(ctx context.Context) {
	fmt.Println("Работа завершена.")
}

func (a *App) Calculate(num1, num2 float64, action string) (float64, error) {
	return a.calc.Calculate(num1, num2, action)
}

func (a *App) ClearHistory() error {
	return a.calc.ClearHistory()
}

func (a *App) GetHistory() []string {
	return a.calc.GetHistory()
}
