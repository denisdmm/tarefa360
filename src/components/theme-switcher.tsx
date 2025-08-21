
"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Sun, Moon, Monitor } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ThemeSwitcher() {
  const { setTheme, theme } = useTheme()

  return (
    <div className="flex items-center space-x-2">
       <Button 
        variant={theme === 'light' ? 'secondary' : 'ghost'} 
        size="sm" 
        onClick={() => setTheme("light")}
        className="w-full justify-center gap-2"
      >
        <Sun className="h-5 w-5" />
        Claro
      </Button>
      <Button 
        variant={theme === 'dark' ? 'secondary' : 'ghost'} 
        size="sm" 
        onClick={() => setTheme("dark")}
        className="w-full justify-center gap-2"
      >
        <Moon className="h-5 w-5" />
        Escuro
      </Button>
      <Button 
        variant={theme === 'system' ? 'secondary' : 'ghost'} 
        size="sm" 
        onClick={() => setTheme("system")}
        className="w-full justify-center gap-2"
      >
        <Monitor className="h-5 w-5" />
        Sistema
      </Button>
    </div>
  )
}
