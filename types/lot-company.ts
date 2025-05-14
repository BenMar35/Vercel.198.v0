export interface LotCompany {
  id: string
  lot_id: string
  company_id: string
  status: LotCompanyStatus
  montant_ht?: number
  montant_ttc?: number
  date_reception?: string
  selected: boolean
  created_at: string
  updated_at: string
}

export type LotCompanyStatus = "consulté" | "offre_reçue" | "retenu" | "non_retenu" | "abandonné"

export interface LotCompanyCreate {
  lot_id: string
  company_id: string
  status?: LotCompanyStatus
  montant_ht?: number
  montant_ttc?: number
  date_reception?: string
  selected?: boolean
}

export interface LotCompanyUpdate {
  status?: LotCompanyStatus
  montant_ht?: number
  montant_ttc?: number
  date_reception?: string
  selected?: boolean
}

export interface LotCompanyWithDetails extends LotCompany {
  company_name: string
  lot_name: string
  lot_numero: string
}

export interface LotCompanyFilters {
  lot_id?: string
  company_id?: string
  status?: LotCompanyStatus
  selected?: boolean
  project_id?: string
}
