import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router-dom";
import Login from "../pages/Login";
import apiClient from "../utils/apiClient";

// Mock react-router-dom's useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Mock API client
jest.mock("../utils/apiClient");

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Clear mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

describe("Login Component", () => {
  test("renders login form correctly", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByText("Welcome Back")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  test("updates input fields correctly", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText("Enter your email");
    const passwordInput = screen.getByPlaceholderText("Enter your password");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(emailInput.value).toBe("test@example.com");
    expect(passwordInput.value).toBe("password123");
  });

  test("successful login redirects user", async () => {
    // Mock API response
    apiClient.post.mockResolvedValue({
      data: {
        accessToken: "fake-access-token",
        refreshToken: "fake-refresh-token",
        role: "user",
        user: { id: 1, name: "Test User" },
        mustChangePassword: 0,
      },
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    // Fill form
    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    // Wait for navigation
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/dashboard"));

    // Ensure token is stored
    expect(localStorage.setItem).toHaveBeenCalledWith("token", "fake-access-token");
  });
});