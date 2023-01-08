import React from "react"
import { screen } from "@testing-library/react"
import { render } from "./test-utils"
import { App } from "./components/App"

test("renders plugin start screen", () => {
  render(<App />)
  const linkElement = screen.getByText(/keyspace/i)
  expect(linkElement).toBeInTheDocument()
})
