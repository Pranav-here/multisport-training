"use client"

import { useState, useEffect } from "react"

interface User {
  id: string
  email: string
  name: string
  avatar: string
  sports: string[]
  location: string
  affiliation: string
  skillLevel: string
  goals: string[]
  privacy: "public" | "friends" | "private"
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })

  useEffect(() => {
    // Check for existing session on mount
    const storedUser = localStorage.getItem("multisport_user")
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        })
      } catch {
        localStorage.removeItem("multisport_user")
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        })
      }
    } else {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
    }
  }, [])

  const login = (email: string, password: string) => {
    // Fake login - in real app this would call an API
    const mockUser: User = {
      id: "1",
      email,
      name: email.split("@")[0],
      avatar: "/diverse-user-avatars.png",
      sports: [],
      location: "",
      affiliation: "",
      skillLevel: "",
      goals: [],
      privacy: "public",
    }

    localStorage.setItem("multisport_user", JSON.stringify(mockUser))
    setAuthState({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
    })

    return Promise.resolve(mockUser)
  }

  const loginWithGoogle = () => {
    // Fake Google login
    const mockUser: User = {
      id: "1",
      email: "user@gmail.com",
      name: "Demo User",
      avatar: "/diverse-user-avatars.png",
      sports: [],
      location: "",
      affiliation: "",
      skillLevel: "",
      goals: [],
      privacy: "public",
    }

    localStorage.setItem("multisport_user", JSON.stringify(mockUser))
    setAuthState({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
    })

    return Promise.resolve(mockUser)
  }

  const updateUser = (updates: Partial<User>) => {
    if (!authState.user) return

    const updatedUser = { ...authState.user, ...updates }
    localStorage.setItem("multisport_user", JSON.stringify(updatedUser))
    setAuthState((prev) => ({
      ...prev,
      user: updatedUser,
    }))
  }

  const logout = () => {
    localStorage.removeItem("multisport_user")
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })
  }

  return {
    ...authState,
    login,
    loginWithGoogle,
    updateUser,
    logout,
  }
}
