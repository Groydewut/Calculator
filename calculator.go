package main

import (
	"encoding/json"
	"fmt"
	"math"
	"os"
)

type Calculator struct {
	History []string `json:"history"`
}

func NewCalculator() *Calculator {
	calc := &Calculator{}
	calc.Load()
	return calc
}

func (c *Calculator) Load() error {
	file, err := os.Open("history.json")
	if err != nil {
		if os.IsNotExist(err) {
			return nil
		}
		return fmt.Errorf("Ошибка при открытии файла: %w", err)
	}
	defer file.Close()
	decoder := json.NewDecoder(file)
	return decoder.Decode(c)
}

func (c *Calculator) Save() error {
	filedata, err := json.MarshalIndent(c, "", " ")
	if err != nil {
		return fmt.Errorf("Произошла ошибка сериализации: %w", err)
	}
	err = os.WriteFile("history.json", filedata, 0644)
	if err != nil {
		return fmt.Errorf("Произошла ошибка при записи в файл: %w", err)
	}
	return nil
}

func (c *Calculator) Record(a, b, res float64, action string) {
	c.History = append(c.History, fmt.Sprintf("%v %s %v = %v", a, action, b, res))

}

func (c *Calculator) Calculate(a, b float64, action string) (float64, error) {
	var res float64
	var err error

	switch action {
	case "+":
		res = a + b
	case "-":
		res = a - b
	case "*":
		res = a * b
	case "/":
		if b == 0 {
			return 0, fmt.Errorf("Деление на ноль не возможно")
		}
		res = a / b

	case "^":
		res = math.Pow(a, b)
	default:
		return 0, fmt.Errorf("Ошибка!Не известное действие")

	}
	c.Record(a, b, res, action)
	err = c.Save()
	if err != nil {
		return 0, err
	}
	return res, nil
}

func (c *Calculator) ClearHistory() error {
	c.History = []string{}
	return c.Save()
}

func (c *Calculator) GetHistory() []string {
	return c.History
}
