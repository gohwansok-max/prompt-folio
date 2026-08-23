import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { readContexts } from "@/entities/context/storage";
import type { ContextRecord } from "@/entities/context/types";
import { readRules } from "@/entities/rule/storage";
import type { RuleRecord } from "@/entities/rule/types";
import ContextForm from "@/features/context-library/components/ContextForm";
import ContextList from "@/features/context-library/components/ContextList";
import { buildContextRecord, deleteContext, upsertContext } from "@/features/context-library/lib";
import RuleForm from "@/features/rule-library/components/RuleForm";
import RuleList from "@/features/rule-library/components/RuleList";
import { buildRuleRecord, deleteRule, upsertRule } from "@/features/rule-library/lib";

type Tab = "rule" | "context";

export default function LibraryPage() {
  const [tab, setTab] = useState<Tab>("rule");
  const [rules, setRules] = useState<RuleRecord[]>(readRules);
  const [contexts, setContexts] = useState<ContextRecord[]>(readContexts);
  const [editingRule, setEditingRule] = useState<RuleRecord | "new" | null>(null);
  const [editingContext, setEditingContext] = useState<ContextRecord | "new" | null>(null);

  function saveRule(form: Parameters<typeof buildRuleRecord>[0]) {
    const existing = editingRule === "new" ? null : editingRule;
    upsertRule(buildRuleRecord(form, existing));
    setRules(readRules());
    setEditingRule(null);
  }

  function removeRule(rule: RuleRecord) {
    if (!window.confirm(`“${rule.name}”을 삭제할까요?`)) return;
    deleteRule(rule.id);
    setRules(readRules());
  }

  function saveContext(form: Parameters<typeof buildContextRecord>[0]) {
    const existing = editingContext === "new" ? null : editingContext;
    upsertContext(buildContextRecord(form, existing));
    setContexts(readContexts());
    setEditingContext(null);
  }

  function removeContext(context: ContextRecord) {
    if (!window.confirm(`“${context.name}”을 삭제할까요?`)) return;
    deleteContext(context.id);
    setContexts(readContexts());
  }

  return (
    <div className="min-h-screen bg-[#F7F4ED] text-[#1C1D21]">
      <header className="sticky top-0 z-30 border-b border-[#1C1D21]/10 bg-[#F7F4ED]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[70px] max-w-[1000px] items-center justify-between px-5 md:px-8">
          <Link href="/agents" className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold text-[#67696C] transition hover:text-[#2563EB]"><ArrowLeft size={14} /> Agent Builder로 돌아가기</Link>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="font-mono text-[10px] font-semibold text-[#67696C] transition hover:text-[#2563EB]">Dashboard</Link>
            <Link href="/harness" className="font-mono text-[10px] font-semibold text-[#67696C] transition hover:text-[#2563EB]">Harness Generator</Link>
            <span className="font-mono text-[9px] font-medium tracking-[0.13em] text-[#6F706F]">RULE · CONTEXT LIBRARY</span>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1000px] px-5 pb-14 pt-8 md:px-8 md:pt-11">
        <div className="mb-7">
          <div className="section-kicker"><span className="counter">NEW</span> AI HARNESS STUDIO</div>
          <h1 className="mt-3 font-serif text-3xl font-bold tracking-[-0.04em] md:text-4xl">Rule · Context 라이브러리</h1>
          <p className="mt-2 max-w-2xl text-[13px] leading-6 text-[#55575B]">Agent를 만들 때 골라 쓸 원칙(Rule)과 배경 지식(Context)을 미리 정리해 두는 곳입니다. Agent Builder 위저드 안에서 즉석으로 추가한 항목도 여기서 함께 관리할 수 있습니다.</p>
          <div className="mt-5 flex gap-1.5 border-b border-[#1C1D21]/10">
            <button onClick={() => setTab("rule")} className={`border-b-2 px-3 py-2.5 font-mono text-[10px] font-semibold transition ${tab === "rule" ? "border-[#2563EB] text-[#2563EB]" : "border-transparent text-[#818388] hover:text-[#4E5055]"}`}>Rule ({rules.length})</button>
            <button onClick={() => setTab("context")} className={`border-b-2 px-3 py-2.5 font-mono text-[10px] font-semibold transition ${tab === "context" ? "border-[#2563EB] text-[#2563EB]" : "border-transparent text-[#818388] hover:text-[#4E5055]"}`}>Context ({contexts.length})</button>
          </div>
        </div>

        {tab === "rule" ? (
          editingRule ? (
            <RuleForm existing={editingRule === "new" ? null : editingRule} onSave={saveRule} onCancel={() => setEditingRule(null)} />
          ) : (
            <RuleList rules={rules} onCreate={() => setEditingRule("new")} onEdit={(rule) => setEditingRule(rule)} onDelete={removeRule} />
          )
        ) : editingContext ? (
          <ContextForm existing={editingContext === "new" ? null : editingContext} onSave={saveContext} onCancel={() => setEditingContext(null)} />
        ) : (
          <ContextList contexts={contexts} onCreate={() => setEditingContext("new")} onEdit={(context) => setEditingContext(context)} onDelete={removeContext} />
        )}
      </main>
    </div>
  );
}
