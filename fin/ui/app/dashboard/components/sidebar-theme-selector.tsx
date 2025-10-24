"use client"

import { useThemeConfig } from "@/components/active-theme"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { IconPalette } from "@tabler/icons-react"

const DEFAULT_THEMES = [
  {
    name: "Default",
    value: "default",
  },
  {
    name: "Blue",
    value: "blue",
  },
  {
    name: "Green",
    value: "green",
  },
  {
    name: "Amber",
    value: "amber",
  },
]

const SCALED_THEMES = [
  {
    name: "Default",
    value: "default-scaled",
  },
  {
    name: "Blue",
    value: "blue-scaled",
  },
]

const MONO_THEMES = [
  {
    name: "Mono",
    value: "mono-scaled",
  },
]

export function SidebarThemeSelector() {
  const { activeTheme, setActiveTheme } = useThemeConfig()

  return (
    <SidebarMenuItem className="group-data-[collapsible=icon]:hidden">
      <SidebarMenuButton asChild>
        <div className="flex w-full items-center gap-2">
          <IconPalette className="size-4" />
          <span>Tema</span>
          <Select value={activeTheme} onValueChange={setActiveTheme}>
            <SelectTrigger className="ml-auto h-6 w-24 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectGroup>
                <SelectLabel>Default</SelectLabel>
                {DEFAULT_THEMES.map((theme) => (
                  <SelectItem key={theme.name} value={theme.value}>
                    {theme.name}
                  </SelectItem>
                ))}
              </SelectGroup>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel>Scaled</SelectLabel>
                {SCALED_THEMES.map((theme) => (
                  <SelectItem key={theme.name} value={theme.value}>
                    {theme.name}
                  </SelectItem>
                ))}
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Monospaced</SelectLabel>
                {MONO_THEMES.map((theme) => (
                  <SelectItem key={theme.name} value={theme.value}>
                    {theme.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
