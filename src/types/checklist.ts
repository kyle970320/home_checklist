export type ChecklistCalculator = {
  mode: 'deposit-ratio'
  marketPrice: string
  deposit: string
  maxDebt: string
  safePercent: string
}

export type ChecklistChoice = {
  mode: 'included-separate' | 'yes-no'
  value: 'included' | 'separate' | 'yes' | 'no' | null
}

export type ChecklistItem = {
  id: string
  label: string
  hint?: string
  checked: boolean
  calculator?: ChecklistCalculator
  choice?: ChecklistChoice
}

export type ChecklistGroup = {
  id: string
  title: string
  description?: string
  items: ChecklistItem[]
}

export type ChecklistSection = {
  id: string
  title: string
  description?: string
  tone?: 'default' | 'warning' | 'accent'
  groups: ChecklistGroup[]
}

export type Checklist = {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  sections: ChecklistSection[]
}
