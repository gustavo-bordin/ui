"use client"

import * as React from "react"
import { IconPlus } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

// Mock data for institutions - in a real app, this would come from an API
const AVAILABLE_INSTITUTIONS = [
  { id: "itau", name: "Itaú", logo: "🏦" },
  { id: "bradesco", name: "Bradesco", logo: "🏛️" },
  { id: "santander", name: "Santander", logo: "🏢" },
  { id: "nubank", name: "Nubank", logo: "💳" },
  { id: "inter", name: "Inter", logo: "🌐" },
  { id: "caixa", name: "Caixa", logo: "🏛️" },
]

export function InstitutionSelector() {
  const [connectedInstitutions, setConnectedInstitutions] = React.useState<
    string[]
  >(["itau", "bradesco", "nubank"])
  const [selectedInstitutions, setSelectedInstitutions] = React.useState<
    string[]
  >(["itau", "bradesco"])
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)

  const handleInstitutionToggle = (institutionId: string) => {
    setSelectedInstitutions((prev) =>
      prev.includes(institutionId)
        ? prev.filter((id) => id !== institutionId)
        : [...prev, institutionId]
    )
  }

  const handleConnectInstitution = (institutionId: string) => {
    if (!connectedInstitutions.includes(institutionId)) {
      setConnectedInstitutions((prev) => [...prev, institutionId])
      setSelectedInstitutions((prev) => [...prev, institutionId])
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="institution-selector" className="sr-only">
        Instituições
      </Label>

      {/* Institution Toggle Buttons */}
      <ToggleGroup
        type="multiple"
        value={selectedInstitutions}
        onValueChange={setSelectedInstitutions}
        variant="outline"
        size="sm"
        className="hidden sm:flex"
      >
        {connectedInstitutions.map((institutionId) => {
          const institution = AVAILABLE_INSTITUTIONS.find(
            (inst) => inst.id === institutionId
          )
          if (!institution) return null

          return (
            <ToggleGroupItem
              key={institutionId}
              value={institutionId}
              className="flex cursor-pointer items-center gap-1.5 px-5"
            >
              <span className="text-sm font-medium">{institution.name}</span>
            </ToggleGroupItem>
          )
        })}
      </ToggleGroup>

      {/* Mobile version - compact toggle */}
      <ToggleGroup
        type="multiple"
        value={selectedInstitutions}
        onValueChange={setSelectedInstitutions}
        variant="outline"
        size="sm"
        className="flex sm:hidden"
      >
        {connectedInstitutions.slice(0, 2).map((institutionId) => {
          const institution = AVAILABLE_INSTITUTIONS.find(
            (inst) => inst.id === institutionId
          )
          if (!institution) return null

          return (
            <ToggleGroupItem
              key={institutionId}
              value={institutionId}
              className="flex cursor-pointer items-center gap-1 px-3"
            >
              <span className="text-xs">{institution.logo}</span>
              <span className="text-xs font-medium">
                {institution.name.slice(0, 3)}
              </span>
            </ToggleGroupItem>
          )
        })}
        {connectedInstitutions.length > 2 && (
          <ToggleGroupItem value="more" className="px-2 text-xs" disabled>
            +{connectedInstitutions.length - 2}
          </ToggleGroupItem>
        )}
      </ToggleGroup>

      {/* Connect Button */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDialogOpen(true)}
            className="hidden sm:flex"
          >
            <IconPlus className="size-4" />
            <span className="hidden lg:inline">Conectar</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Gerenciar Instituições</DialogTitle>
            <DialogDescription>
              Conecte suas contas bancárias e selecione quais dados visualizar
              no dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">
                Instituições Conectadas
              </Label>
              <div className="mt-2 space-y-2">
                {connectedInstitutions.map((institutionId) => {
                  const institution = AVAILABLE_INSTITUTIONS.find(
                    (inst) => inst.id === institutionId
                  )
                  if (!institution) return null
                  return (
                    <div
                      key={institutionId}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={institutionId}
                        checked={selectedInstitutions.includes(institutionId)}
                        onCheckedChange={() =>
                          handleInstitutionToggle(institutionId)
                        }
                      />
                      <Label
                        htmlFor={institutionId}
                        className="flex flex-1 cursor-pointer items-center gap-2"
                      >
                        <span>{institution.logo}</span>
                        <span>{institution.name}</span>
                      </Label>
                    </div>
                  )
                })}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">
                Conectar Nova Instituição
              </Label>
              <div className="mt-2 space-y-2">
                {AVAILABLE_INSTITUTIONS.filter(
                  (inst) => !connectedInstitutions.includes(inst.id)
                ).map((institution) => (
                  <Button
                    key={institution.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleConnectInstitution(institution.id)}
                  >
                    <span className="mr-2">{institution.logo}</span>
                    <span>{institution.name}</span>
                    <IconPlus className="ml-auto size-4" />
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
