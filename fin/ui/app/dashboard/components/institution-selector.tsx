"use client"

import * as React from "react"
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
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { IconPlus } from "@tabler/icons-react"
import { Loader2 } from "lucide-react"

// Bank connection type from API
interface BankConnection {
  id: string
  user_id: string
  link_id: string
  institution: string
  status: string
  connected_at: string
  last_sync_at: string | null
  created_at: string
  updated_at: string
}

// Map Belvo institution IDs to display names and logos
const INSTITUTION_MAP: Record<string, { name: string; logo: string }> = {
  ofnubank_br_retail: { name: "Nubank", logo: "🟣" },
  ofsantander_br_retail: { name: "Santander", logo: "🔴" },
  ofitau_br_retail: { name: "Itaú", logo: "🟠" },
  ofbradesco_br_retail: { name: "Bradesco", logo: "🔵" },
  ofbanco_do_brasil_br_retail: { name: "Banco do Brasil", logo: "🟡" },
  ofcaixa_br_retail: { name: "Caixa", logo: "🔵" },
  ofmercadopago_br_retail: { name: "MercadoPago", logo: "💙" },
  ofpicpay_br_retail: { name: "PicPay", logo: "🟢" },
  ofsicredi_br_retail: { name: "Sicredi", logo: "🟠" },
  ofsicoob_br_retail: { name: "Sicoob", logo: "🔵" },
  ofbanco_pan_br_retail: { name: "Banco Pan", logo: "🟣" },
  ofbanco_do_nordeste_br_retail: { name: "Banco do Nordeste", logo: "🟡" },
  ofbanco_bmg_br_retail: { name: "Banco BMG", logo: "🟤" },
}

export function InstitutionSelector() {
  const [bankConnections, setBankConnections] = React.useState<
    BankConnection[]
  >([])
  const [selectedInstitutions, setSelectedInstitutions] = React.useState<
    string[]
  >([])
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)

  // Fetch bank connections on mount
  React.useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response = await fetch("/api/bank-connections")
        if (!response.ok) throw new Error("Failed to fetch connections")

        const data = await response.json()
        setBankConnections(data.connections || [])

        // Select all active connections by default
        const activeIds = (data.connections || [])
          .filter((conn: BankConnection) => conn.status === "active")
          .map((conn: BankConnection) => conn.id)
        setSelectedInstitutions(activeIds)
      } catch (error) {
        console.error("Error fetching bank connections:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchConnections()
  }, [])

  const handleInstitutionToggle = (connectionId: string) => {
    setSelectedInstitutions((prev) =>
      prev.includes(connectionId)
        ? prev.filter((id) => id !== connectionId)
        : [...prev, connectionId]
    )
  }

  const getInstitutionDisplay = (institutionId: string) => {
    return (
      INSTITUTION_MAP[institutionId] || {
        name: institutionId,
        logo: "🏦",
      }
    )
  }

  const isSyncing = (connection: BankConnection) => {
    // If last_sync_at is null, the webhook hasn't completed yet
    return !connection.last_sync_at
  }

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="institution-selector" className="sr-only">
        Instituições
      </Label>

      {/* Institution Toggle Buttons */}
      {isLoading ? (
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Carregando...</span>
        </div>
      ) : (
        <ToggleGroup
          type="multiple"
          value={selectedInstitutions}
          onValueChange={setSelectedInstitutions}
          variant="outline"
          size="sm"
          className="hidden sm:flex"
        >
          {bankConnections.map((connection) => {
            const institution = getInstitutionDisplay(connection.institution)
            const syncing = isSyncing(connection)

            return (
              <ToggleGroupItem
                key={connection.id}
                value={connection.id}
                className="flex cursor-pointer items-center gap-1.5 px-5"
                disabled={syncing}
              >
                {syncing ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <span>{institution.logo}</span>
                )}
                <span className="text-sm font-medium">
                  {institution.name}
                  {syncing && " (sincronizando...)"}
                </span>
              </ToggleGroupItem>
            )
          })}
        </ToggleGroup>
      )}

      {/* Mobile version - compact toggle */}
      {!isLoading && (
        <ToggleGroup
          type="multiple"
          value={selectedInstitutions}
          onValueChange={setSelectedInstitutions}
          variant="outline"
          size="sm"
          className="flex sm:hidden"
        >
          {bankConnections.slice(0, 2).map((connection) => {
            const institution = getInstitutionDisplay(connection.institution)
            const syncing = isSyncing(connection)

            return (
              <ToggleGroupItem
                key={connection.id}
                value={connection.id}
                className="flex cursor-pointer items-center gap-1 px-3"
                disabled={syncing}
              >
                {syncing ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <span className="text-xs">{institution.logo}</span>
                )}
                <span className="text-xs font-medium">
                  {institution.name.slice(0, 3)}
                </span>
              </ToggleGroupItem>
            )
          })}
          {bankConnections.length > 2 && (
            <ToggleGroupItem value="more" className="px-2 text-xs" disabled>
              +{bankConnections.length - 2}
            </ToggleGroupItem>
          )}
        </ToggleGroup>
      )}

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
                {bankConnections.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    Nenhuma instituição conectada ainda.
                  </p>
                ) : (
                  bankConnections.map((connection) => {
                    const institution = getInstitutionDisplay(
                      connection.institution
                    )
                    const syncing = isSyncing(connection)

                    return (
                      <div
                        key={connection.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={connection.id}
                          checked={selectedInstitutions.includes(connection.id)}
                          onCheckedChange={() =>
                            handleInstitutionToggle(connection.id)
                          }
                          disabled={syncing}
                        />
                        <Label
                          htmlFor={connection.id}
                          className="flex flex-1 cursor-pointer items-center gap-2"
                        >
                          {syncing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <span>{institution.logo}</span>
                          )}
                          <span>
                            {institution.name}
                            {syncing && (
                              <span className="text-muted-foreground ml-2 text-xs">
                                (sincronizando dados...)
                              </span>
                            )}
                          </span>
                        </Label>
                      </div>
                    )
                  })
                )}
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
