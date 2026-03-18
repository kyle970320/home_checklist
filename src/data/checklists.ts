import { createDefaultChecklistSections } from './checklistTemplate'
import type { Checklist, ChecklistCalculator, ChecklistGroup, ChecklistItem, ChecklistSection } from '../types/checklist'
import { safeJsonParse } from '../utils/storage'

const STORAGE_KEY = 'home-checklist/checklists:v1'

type LegacyChecklist = {
  id: string
  title: string
  createdAt: number
  updatedAt: number
}

type StoredChecklist = LegacyChecklist & {
  sections?: ChecklistSection[]
}

type StorageShape = {
  items: StoredChecklist[]
}

type CalculatorPatch = Partial<ChecklistCalculator>

function now() {
  return Date.now()
}

function cloneDefaultSections() {
  return createDefaultChecklistSections()
}

function mergeCalculator(
  templateCalculator: ChecklistCalculator | undefined,
  storedCalculator: ChecklistCalculator | undefined,
): ChecklistCalculator | undefined {
  if (!templateCalculator) return undefined
  return {
    ...templateCalculator,
    ...storedCalculator,
  }
}

function mergeItems(templateItems: ChecklistItem[], storedItems: ChecklistItem[] | undefined) {
  const storedMap = new Map(storedItems?.map((item) => [item.id, item]) ?? [])

  return templateItems.map((item) => {
    const stored = storedMap.get(item.id)
    return {
      ...item,
      checked: stored?.checked ?? item.checked,
      calculator: mergeCalculator(item.calculator, stored?.calculator),
    }
  })
}

function mergeGroups(templateGroups: ChecklistGroup[], storedGroups: ChecklistGroup[] | undefined) {
  const storedMap = new Map(storedGroups?.map((group) => [group.id, group]) ?? [])

  return templateGroups.map((group) => {
    const stored = storedMap.get(group.id)
    return {
      ...group,
      items: mergeItems(group.items, stored?.items),
    }
  })
}

function normalizeChecklist(item: StoredChecklist): Checklist {
  const template = cloneDefaultSections()
  const storedSections = item.sections
  const storedMap = new Map(storedSections?.map((section) => [section.id, section]) ?? [])

  return {
    id: item.id,
    title: item.title,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    sections: template.map((section) => {
      const stored = storedMap.get(section.id)
      return {
        ...section,
        groups: mergeGroups(section.groups, stored?.groups),
      }
    }),
  }
}

function loadShape(): StorageShape {
  const parsed = safeJsonParse<StorageShape>(localStorage.getItem(STORAGE_KEY))
  if (!parsed || !Array.isArray(parsed.items)) return { items: [] }
  return { items: parsed.items }
}

function saveShape(shape: StorageShape) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(shape))
}

function updateChecklist(shape: StorageShape, id: string, updater: (item: Checklist) => Checklist): Checklist {
  const idx = shape.items.findIndex((x) => x.id === id)
  if (idx < 0) throw new Error('not found')

  const current = normalizeChecklist(shape.items[idx])
  const next = updater(current)
  shape.items[idx] = next
  saveShape(shape)
  return next
}

export function listChecklists(): Checklist[] {
  const { items } = loadShape()
  return items.map(normalizeChecklist).sort((a, b) => b.updatedAt - a.updatedAt)
}

export function getChecklist(id: string): Checklist | null {
  const found = loadShape().items.find((x) => x.id === id)
  return found ? normalizeChecklist(found) : null
}

export function createChecklist(title: string): Checklist {
  const t = title.trim()
  if (!t) throw new Error('title is required')

  const shape = loadShape()
  const ts = now()
  const id = crypto.randomUUID()
  const item: Checklist = {
    id,
    title: t,
    createdAt: ts,
    updatedAt: ts,
    sections: cloneDefaultSections(),
  }

  shape.items.unshift(item)
  saveShape(shape)
  return item
}

export function updateChecklistTitle(id: string, title: string): Checklist {
  const t = title.trim()
  if (!t) throw new Error('title is required')

  const shape = loadShape()
  return updateChecklist(shape, id, (item) => ({
    ...item,
    title: t,
    updatedAt: now(),
  }))
}

export function toggleChecklistItem(id: string, itemId: string): Checklist {
  const shape = loadShape()

  return updateChecklist(shape, id, (item) => ({
    ...item,
    updatedAt: now(),
    sections: item.sections.map((section) => ({
      ...section,
      groups: section.groups.map((group) => ({
        ...group,
        items: group.items.map((entry) => (entry.id === itemId ? { ...entry, checked: !entry.checked } : entry)),
      })),
    })),
  }))
}

export function updateChecklistCalculator(id: string, itemId: string, patch: CalculatorPatch): Checklist {
  const shape = loadShape()

  return updateChecklist(shape, id, (item) => ({
    ...item,
    updatedAt: now(),
    sections: item.sections.map((section) => ({
      ...section,
      groups: section.groups.map((group) => ({
        ...group,
        items: group.items.map((entry) => {
          if (entry.id !== itemId || !entry.calculator) return entry
          return {
            ...entry,
            calculator: {
              ...entry.calculator,
              ...patch,
            },
          }
        }),
      })),
    })),
  }))
}

export function deleteChecklist(id: string) {
  const shape = loadShape()
  const next = shape.items.filter((x) => x.id !== id)
  saveShape({ items: next })
}
