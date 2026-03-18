import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal from '../components/Modal'
import ThemeToggle from '../components/ThemeToggle'
import { createChecklist, deleteChecklist, listChecklists, updateChecklistTitle } from '../data/checklists'
import type { Checklist } from '../types/checklist'

type DeleteState = { isOpen: boolean; target: Checklist | null }

export default function HomePage() {
  const navigate = useNavigate()
  const [refreshKey, setRefreshKey] = useState(0)
  const [createTitle, setCreateTitle] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [deleteState, setDeleteState] = useState<DeleteState>({ isOpen: false, target: null })

  const items = useMemo(() => {
    void refreshKey
    return listChecklists()
  }, [refreshKey])

  const bump = () => setRefreshKey((k) => k + 1)

  const onCreate = () => {
    if (!createTitle.trim()) return
    const created = createChecklist(createTitle)
    setCreateTitle('')
    bump()
    navigate(`/${created.id}`)
  }

  const startEdit = (item: Checklist) => {
    setEditId(item.id)
    setEditTitle(item.title)
  }

  const cancelEdit = () => {
    setEditId(null)
    setEditTitle('')
  }

  const saveEdit = () => {
    if (!editId) return
    updateChecklistTitle(editId, editTitle)
    bump()
    cancelEdit()
  }

  const askDelete = (item: Checklist) => setDeleteState({ isOpen: true, target: item })
  const closeDelete = () => setDeleteState({ isOpen: false, target: null })

  const confirmDelete = () => {
    if (!deleteState.target) return
    deleteChecklist(deleteState.target.id)
    bump()
    closeDelete()
  }

  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-900 transition-colors selection:bg-indigo-500/30 selection:text-white dark:bg-zinc-950 dark:text-white">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">체크리스트</h1>
            <p className="mt-2 text-sm text-zinc-600 sm:text-base dark:text-white/70">
              새 체크리스트를 만들거나 기존 체크리스트를 이어서 관리해보세요.
            </p>
          </div>
          <ThemeToggle />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border-2 border-dashed border-zinc-300 bg-white p-4 shadow-sm dark:border-white/20 dark:bg-white/[0.03]">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-dashed border-zinc-300 text-2xl leading-none dark:border-white/30">
                +
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-extrabold">새 체크리스트</div>
                <div className="mt-1 text-xs text-zinc-500 dark:text-white/60">
                  제목을 입력하면 바로 생성되고 상세 페이지로 이동해요.
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-2">
              <input
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none placeholder:text-zinc-400 focus:border-indigo-400 dark:border-white/10 dark:bg-black/30 dark:placeholder:text-white/40"
                value={createTitle}
                placeholder="제목 입력 후 Enter"
                onChange={(e) => setCreateTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onCreate()
                }}
              />
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-3 py-2 text-sm font-extrabold text-white hover:bg-indigo-400 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 dark:text-black"
                disabled={!createTitle.trim()}
                onClick={onCreate}
              >
                생성
              </button>
            </div>
          </div>

          {items.map((item) => {
            const isEditing = editId === item.id
            return (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition-colors dark:border-white/10 dark:bg-white/[0.04]"
              >
                {!isEditing ? (
                  <button
                    type="button"
                    className="absolute inset-0 cursor-pointer"
                    onClick={() => navigate(`/${item.id}`)}
                    aria-label={`${item.title} 열기`}
                  />
                ) : null}

                <div className="relative grid gap-3">
                  {isEditing ? (
                    <>
                      <input
                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-semibold outline-none focus:border-indigo-400 dark:border-white/10 dark:bg-black/30"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                      />
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-3 py-2 text-sm font-extrabold text-white hover:bg-indigo-400 active:translate-y-px disabled:opacity-50 dark:text-black"
                          onClick={saveEdit}
                          disabled={!editTitle.trim()}
                        >
                          저장
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-zinc-100 px-3 py-2 text-sm font-bold text-zinc-700 hover:bg-zinc-200 active:translate-y-px dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                          onClick={cancelEdit}
                        >
                          취소
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="break-words text-lg font-black leading-snug tracking-tight">{item.title}</div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-zinc-100 px-3 py-2 text-sm font-bold text-zinc-700 hover:bg-zinc-200 active:translate-y-px dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                          onClick={(e) => {
                            e.stopPropagation()
                            startEdit(item)
                          }}
                        >
                          수정
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700 hover:bg-rose-100 active:translate-y-px dark:border-rose-400/30 dark:bg-rose-500/15 dark:text-white dark:hover:bg-rose-500/20"
                          onClick={(e) => {
                            e.stopPropagation()
                            askDelete(item)
                          }}
                        >
                          삭제
                        </button>
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-white/50">클릭하면 상세로 이동</div>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <Modal
          title="정말 삭제할까요?"
          isOpen={deleteState.isOpen}
          onClose={closeDelete}
          footer={
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-zinc-100 px-3 py-2 text-sm font-bold text-zinc-700 hover:bg-zinc-200 active:translate-y-px dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                onClick={closeDelete}
              >
                취소
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700 hover:bg-rose-100 active:translate-y-px dark:border-rose-400/30 dark:bg-rose-500/15 dark:text-white dark:hover:bg-rose-500/20"
                onClick={confirmDelete}
              >
                삭제
              </button>
            </div>
          }
        >
          <p className="m-0 text-sm">
            <span className="font-extrabold">{deleteState.target?.title}</span> 체크리스트를 삭제합니다. 이 작업은 되돌릴 수
            없어요.
          </p>
        </Modal>
      </div>
    </div>
  )
}
