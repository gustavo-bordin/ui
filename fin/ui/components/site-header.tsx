import Link from "next/link"
import { CommandMenu } from "@/fin/ui/components/command-menu"
import { GitHubLink } from "@/fin/ui/components/github-link"
import { Icons } from "@/fin/ui/components/icons"
import { MainNav } from "@/fin/ui/components/main-nav"
import { MobileNav } from "@/fin/ui/components/mobile-nav"
import { ModeSwitcher } from "@/fin/ui/components/mode-switcher"
import { SiteConfig } from "@/fin/ui/components/site-config"
import { Button } from "@/fin/ui/components/ui/button"
import { Separator } from "@/fin/ui/components/ui/separator"

import { getColors } from "@/lib/colors"
import { siteConfig } from "@/lib/config"

export function SiteHeader() {
  const colors = getColors()
  const pageTree = null // Simplified since we removed Fumadocs

  return (
    <header className="bg-background sticky top-0 z-50 w-full">
      <div className="container-wrapper 3xl:fixed:px-0 px-6">
        <div className="3xl:fixed:container flex h-(--header-height) items-center gap-2 **:data-[slot=separator]:!h-4">
          <MobileNav
            tree={pageTree}
            items={siteConfig.navItems}
            className="flex lg:hidden"
          />
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="hidden size-8 lg:flex"
          >
            <Link href="/">
              <Icons.logo className="size-5" />
              <span className="sr-only">{siteConfig.name}</span>
            </Link>
          </Button>
          <MainNav items={siteConfig.navItems} className="hidden lg:flex" />
          <div className="ml-auto flex items-center gap-2 md:flex-1 md:justify-end">
            <div className="hidden w-full flex-1 md:flex md:w-auto md:flex-none">
              <CommandMenu
                tree={pageTree}
                colors={colors}
                navItems={siteConfig.navItems}
              />
            </div>
            <Separator
              orientation="vertical"
              className="ml-2 hidden lg:block"
            />
            <GitHubLink />
            <Separator orientation="vertical" className="3xl:flex hidden" />
            <SiteConfig className="3xl:flex hidden" />
            <Separator orientation="vertical" />
            <ModeSwitcher />
          </div>
        </div>
      </div>
    </header>
  )
}
