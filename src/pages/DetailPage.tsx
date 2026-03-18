import { useEffect, useState } from "react";
import {
  CheckCheck,
  ChevronLeft,
  CircleAlert,
  FileText,
  House,
  ShieldCheck,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import {
  getChecklist,
  toggleChecklistItem,
  updateChecklistCalculator,
} from "../data/checklists";
import type {
  Checklist,
  ChecklistCalculator,
  ChecklistItem,
} from "../types/checklist";

function countChecklistProgress(sections: Checklist["sections"]) {
  const items = sections.flatMap((section) =>
    section.groups.flatMap((group) => group.items),
  );
  const checked = items.filter((item) => item.checked).length;
  const total = items.length;
  return {
    checked,
    total,
    percent: total === 0 ? 0 : Math.round((checked / total) * 100),
  };
}

function formatDate(value: number) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(value);
}

function sectionIcon(sectionId: string) {
  if (sectionId === "registry") return FileText;
  if (sectionId === "onsite") return House;
  return ShieldCheck;
}

function sectionTone(tone: "default" | "warning" | "accent" | undefined) {
  if (tone === "warning") {
    return "border-amber-200 bg-amber-50/80 dark:border-amber-400/20 dark:bg-amber-500/10";
  }

  if (tone === "accent") {
    return "border-indigo-200 bg-indigo-50/80 dark:border-indigo-400/20 dark:bg-indigo-500/10";
  }

  return "border-zinc-200 bg-white dark:border-white/10 dark:bg-white/[0.04]";
}

function parseNumber(value: string) {
  const sanitized = value.replaceAll(",", "").trim();
  if (!sanitized) return null;
  const parsed = Number(sanitized);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function calculateDepositRatio(calculator: ChecklistCalculator) {
  const marketPriceInput = parseNumber(calculator.marketPrice);
  const depositInput = parseNumber(calculator.deposit);
  const maxDebtInput = parseNumber(calculator.maxDebt);
  const safePercent = parseNumber(calculator.safePercent);

  if (
    !marketPriceInput ||
    marketPriceInput <= 0 ||
    depositInput === null ||
    maxDebtInput === null ||
    safePercent === null
  ) {
    return null;
  }

  const marketPrice = marketPriceInput * 100000000;
  const deposit = depositInput * 10000000;
  const maxDebt = maxDebtInput * 10000000;
  const total = deposit + maxDebt;
  const ratio = (total / marketPrice) * 100;

  return {
    total,
    ratio,
    safePercent,
    isSafe: ratio <= safePercent,
  };
}

function updateLocalChecklist(current: Checklist | null, next: Checklist) {
  return current?.id === next.id ? next : current;
}

function CalculatorCard({
  checklistId,
  item,
  onChecklistChange,
}: {
  checklistId: string;
  item: ChecklistItem;
  onChecklistChange: (next: Checklist) => void;
}) {
  if (!item.calculator) return null;

  const result = calculateDepositRatio(item.calculator);

  const handleCalculatorChange =
    (field: keyof ChecklistCalculator) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const next = updateChecklistCalculator(checklistId, item.id, {
        [field]: event.target.value,
      });
      onChecklistChange(next);
    };

  return (
    <div className="mt-3 rounded-2xl border border-indigo-200 bg-indigo-50/80 p-3 dark:border-indigo-400/20 dark:bg-indigo-500/10">
      <div className="grid gap-3 xl:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="text-xs font-semibold text-zinc-600 dark:text-white/70">
            주택 시세 (억)
          </span>
          <div className="flex overflow-hidden rounded-xl border border-zinc-200 bg-white focus-within:border-indigo-400 dark:border-white/10 dark:bg-zinc-950/60">
            <input
              value={item.calculator.marketPrice}
              onChange={handleCalculatorChange("marketPrice")}
              inputMode="decimal"
              placeholder="예: 2"
              className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none"
            />
            <span className="shrink-0 border-l border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-500 dark:border-white/10 dark:text-white/55">
              억원
            </span>
          </div>
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-semibold text-zinc-600 dark:text-white/70">
            보증금 (천)
          </span>
          <div className="flex overflow-hidden rounded-xl border border-zinc-200 bg-white focus-within:border-indigo-400 dark:border-white/10 dark:bg-zinc-950/60">
            <input
              value={item.calculator.deposit}
              onChange={handleCalculatorChange("deposit")}
              inputMode="decimal"
              placeholder="예: 6"
              className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none"
            />
            <span className="shrink-0 border-l border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-500 dark:border-white/10 dark:text-white/55">
              천만원
            </span>
          </div>
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-semibold text-zinc-600 dark:text-white/70">
            채권최고액 (천)
          </span>
          <div className="flex overflow-hidden rounded-xl border border-zinc-200 bg-white focus-within:border-indigo-400 dark:border-white/10 dark:bg-zinc-950/60">
            <input
              value={item.calculator.maxDebt}
              onChange={handleCalculatorChange("maxDebt")}
              inputMode="decimal"
              placeholder="예: 5"
              className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none"
            />
            <span className="shrink-0 border-l border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-500 dark:border-white/10 dark:text-white/55">
              천만원
            </span>
          </div>
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-semibold text-zinc-600 dark:text-white/70">
            안전 기준 %
          </span>
          <div className="flex overflow-hidden rounded-xl border border-zinc-200 bg-white focus-within:border-indigo-400 dark:border-white/10 dark:bg-zinc-950/60">
            <input
              value={item.calculator.safePercent}
              onChange={handleCalculatorChange("safePercent")}
              inputMode="decimal"
              placeholder="예: 70"
              className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none"
            />
            <span className="shrink-0 border-l border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-500 dark:border-white/10 dark:text-white/55">
              %
            </span>
          </div>
        </label>
      </div>

      {result ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 bg-white px-3 py-3 dark:border-white/10 dark:bg-zinc-950/60">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-white/50">
              합계
            </div>
            <div className="mt-1 text-sm font-bold">
              {formatNumber(result.total)}원
            </div>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white px-3 py-3 dark:border-white/10 dark:bg-zinc-950/60">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-white/50">
              계산 비율
            </div>
            <div className="mt-1 text-sm font-bold">
              {result.ratio.toFixed(1)}%
            </div>
          </div>
          <div
            className={`rounded-xl border px-3 py-3 ${
              result.isSafe
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-200"
                : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-200"
            }`}
          >
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-80">
              안전 여부
            </div>
            <div className="mt-1 text-sm font-bold">
              {result.isSafe
                ? `기준 이하 (${result.safePercent}%)`
                : `기준 초과 (${result.safePercent}%)`}
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-xs leading-5 text-zinc-500 dark:text-white/55">
          시세는 억원, 보증금과 채권최고액은 천만원 단위로 입력하면 자동으로
          비율을 계산해 안전 기준 이하인지 보여줍니다.
        </p>
      )}
    </div>
  );
}

export default function DetailPage() {
  const { id } = useParams();
  const [item, setItem] = useState<Checklist | null>(() =>
    id ? getChecklist(id) : null,
  );

  useEffect(() => {
    setItem(id ? getChecklist(id) : null);
  }, [id]);

  if (!id) {
    return (
      <div className="min-h-dvh bg-zinc-50 text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h1 className="text-2xl font-black sm:text-3xl">잘못된 접근</h1>
            <ThemeToggle />
          </div>
          <div className="mt-4">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-zinc-100 px-3 py-2 text-sm font-bold text-zinc-700 hover:bg-zinc-200 active:translate-y-px dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              홈으로
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-dvh bg-zinc-50 text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black sm:text-3xl">
                존재하지 않는 체크리스트
              </h1>
              <p className="mt-2 text-sm text-zinc-600 dark:text-white/70">
                ID: {id}
              </p>
            </div>
            <ThemeToggle />
          </div>
          <div className="mt-4 flex gap-2">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-zinc-100 px-3 py-2 text-sm font-bold text-zinc-700 hover:bg-zinc-200 active:translate-y-px dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              홈으로
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const progress = countChecklistProgress(item.sections);

  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            <ChevronLeft size={16} />
            목록으로
          </Link>
          <ThemeToggle />
        </div>

        <section className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <div className="bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_34%),linear-gradient(135deg,_rgba(255,255,255,0.98),_rgba(244,244,245,0.92))] px-5 py-6 dark:bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.24),_transparent_34%),linear-gradient(135deg,_rgba(24,24,27,0.96),_rgba(9,9,11,0.92))] sm:px-7 sm:py-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-indigo-500 dark:text-indigo-300">
                  Monthly Rent
                </p>
                <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                  {item.title}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-white/70">
                  등기부등본 확인부터 현장 점검, 계약서 특약까지 한 번에 체크할
                  수 있는 월세 체크리스트예요. 체크와 계산 값은 이 브라우저에
                  자동 저장됩니다.
                </p>
              </div>

              <div className="grid min-w-[250px] gap-3 sm:grid-cols-3 lg:min-w-[320px] lg:grid-cols-1">
                <div className="rounded-2xl border border-zinc-200/80 bg-white/80 p-4 backdrop-blur dark:border-white/10 dark:bg-white/6">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-white/45">
                    진행률
                  </div>
                  <div className="mt-2 flex items-end gap-2">
                    <span className="text-3xl font-black">
                      {progress.percent}%
                    </span>
                    <span className="pb-1 text-sm text-zinc-500 dark:text-white/50">
                      {progress.checked}/{progress.total}
                    </span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-zinc-200 dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-[width]"
                      style={{ width: `${progress.percent}%` }}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-200/80 bg-white/80 p-4 backdrop-blur dark:border-white/10 dark:bg-white/6">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-white/45">
                    섹션 수
                  </div>
                  <div className="mt-2 text-3xl font-black">
                    {item.sections.length}
                  </div>
                  <div className="mt-2 text-sm text-zinc-500 dark:text-white/50">
                    등기부등본, 현장 확인, 특약사항
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-200/80 bg-white/80 p-4 backdrop-blur dark:border-white/10 dark:bg-white/6">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-white/45">
                    생성일
                  </div>
                  <div className="mt-2 text-lg font-bold">
                    {formatDate(item.createdAt)}
                  </div>
                  <div className="mt-2 text-sm text-zinc-500 dark:text-white/50">
                    체크 상태와 계산 결과는 자동 저장됩니다.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {item.sections.map((section) => {
            const Icon = sectionIcon(section.id);
            const sectionItems = section.groups.flatMap((group) => group.items);
            const doneCount = sectionItems.filter(
              (entry) => entry.checked,
            ).length;

            return (
              <article
                key={section.id}
                className={`rounded-[26px] border p-4 shadow-sm transition-colors sm:p-5 ${sectionTone(section.tone)}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950">
                      <Icon size={20} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black tracking-tight">
                        {section.title}
                      </h2>
                      {section.description ? (
                        <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-white/70">
                          {section.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-bold text-zinc-600 dark:border-white/10 dark:bg-white/8 dark:text-white/70">
                    {doneCount}/{sectionItems.length}
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  {section.groups.map((group) => (
                    <div
                      key={group.id}
                      className="rounded-2xl border border-zinc-200/80 bg-white/80 p-4 dark:border-white/8 dark:bg-black/10"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-black sm:text-base">
                            {group.title}
                          </h3>
                          {group.description ? (
                            <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-white/55">
                              {group.description}
                            </p>
                          ) : null}
                        </div>
                        <div className="text-xs font-semibold text-zinc-500 dark:text-white/45">
                          {group.items.filter((entry) => entry.checked).length}/
                          {group.items.length}
                        </div>
                      </div>

                      <div className="mt-3 space-y-2.5">
                        {group.items.map((entry) => (
                          <div
                            key={entry.id}
                            className="rounded-2xl border border-zinc-200 bg-zinc-50/70 px-3 py-3 transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-white/8 dark:bg-white/[0.03] dark:hover:border-indigo-400/30 dark:hover:bg-indigo-500/10"
                          >
                            <label className="flex cursor-pointer items-start gap-3">
                              <input
                                type="checkbox"
                                className="mt-1 h-4 w-4 rounded border-zinc-300 text-indigo-500 focus:ring-indigo-400"
                                checked={entry.checked}
                                onChange={() => {
                                  setItem((current) =>
                                    updateLocalChecklist(
                                      current,
                                      toggleChecklistItem(item.id, entry.id),
                                    ),
                                  );
                                }}
                              />
                              <div className="min-w-0">
                                <div
                                  className={`text-sm font-semibold leading-6 ${entry.checked ? "text-zinc-400 line-through dark:text-white/35" : ""}`}
                                >
                                  {entry.label}
                                </div>
                                {entry.hint ? (
                                  <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-white/55">
                                    {entry.hint}
                                  </p>
                                ) : null}
                              </div>
                            </label>

                            {entry.calculator ? (
                              <CalculatorCard
                                checklistId={item.id}
                                item={entry}
                                onChecklistChange={(next) =>
                                  setItem((current) =>
                                    updateLocalChecklist(current, next),
                                  )
                                }
                              />
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </section>

        <section className="rounded-[26px] border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-200">
              <CircleAlert size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">체크 포인트</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-white/70">
                위험 등기 여부, 보증금 비율, 누수와 곰팡이 흔적은 한 번 더 교차
                확인하는 편이 좋아요. 계약 직전에는 특약사항 문구가 실제
                계약서에 반영됐는지도 꼭 확인하세요.
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-2 text-xs font-semibold text-zinc-600 dark:bg-white/8 dark:text-white/70">
              <CheckCheck size={14} />
              자동 저장
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-2 text-xs font-semibold text-zinc-600 dark:bg-white/8 dark:text-white/70">
              <ShieldCheck size={14} />
              보증금 보호 중심
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
