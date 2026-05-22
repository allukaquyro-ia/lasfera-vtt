"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusChip } from "@/components/ui/StatusChip";
import { useSession } from "@/state/SessionContext";
import type { Spell, SpellActionType } from "@/types/spells";

const classLabels: Record<string, string> = {
  cleric: "Clérigo",
  sorcerer: "Feiticeiro",
  warlock: "Bruxo",
  wizard: "Mago",
  ranger: "Patrulheiro",
  bard: "Bardo",
  druid: "Druida",
  paladin: "Paladino",
};

const progressionLabels: Record<string, string> = {
  full_caster: "conjurador completo",
  half_caster: "meio-conjurador",
  pact_magic: "magia de pacto",
};

export function SpellcastingPanel({ actorId }: { actorId: string }) {
  const { state, actorsById, dispatch } = useSession();
  const spellcasting = state.spellcasting[actorId];
  const actor = actorsById.get(actorId);
  const [query, setQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [schoolFilter, setSchoolFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [concentrationOnly, setConcentrationOnly] = useState(false);
  const [ritualOnly, setRitualOnly] = useState(false);
  const [preparedOnly, setPreparedOnly] = useState(false);
  const [targetActorId, setTargetActorId] = useState(actorId);
  const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null);
  const [slotBySpell, setSlotBySpell] = useState<Record<string, number>>({});
  const slots = state.spellSlots[actorId] ?? [];
  const pact = state.pactSlots[actorId];
  const activeActors = state.tokens.map((token) => actorsById.get(token.actorId)).filter(Boolean);

  const filteredSpells = useMemo(() => {
    if (!spellcasting) return [];
    return spellcasting.spells.filter((spell) => {
      if (query && !spell.name.toLowerCase().includes(query.toLowerCase())) return false;
      if (levelFilter !== "all" && spell.level !== Number(levelFilter)) return false;
      if (schoolFilter !== "all" && spell.school !== schoolFilter) return false;
      if (actionFilter !== "all" && spell.actionType !== actionFilter) return false;
      if (concentrationOnly && !spell.concentration) return false;
      if (ritualOnly && !spell.ritual) return false;
      if (preparedOnly && !spell.isPrepared) return false;
      return true;
    });
  }, [actionFilter, concentrationOnly, levelFilter, preparedOnly, query, ritualOnly, schoolFilter, spellcasting]);

  if (!spellcasting || !actor) {
    return <div className="rounded-lg border border-white/10 bg-black/25 p-4 text-stone-400">Este personagem não possui conjuração normal configurada.</div>;
  }

  function cast(spell: Spell) {
    const chosenSlot = spell.level === 0 ? undefined : spellcasting.progressionType === "pact_magic" ? pact?.slotLevel : slotBySpell[spell.id] ?? spell.level;
    dispatch({ type: "cast-spell", actorId, targetActorId, spell, slotLevel: chosenSlot });
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="grid gap-3 md:grid-cols-5">
          <Info title="Classe" value={classLabels[spellcasting.className]} />
          <Info title="Habilidade" value={spellcasting.spellcastingAbility} />
          <Info title="CD" value={String(spellcasting.spellSaveDc)} />
          <Info title="Ataque mágico" value={`+${spellcasting.spellAttackBonus}`} />
          <Info title="Progressão" value={progressionLabels[spellcasting.progressionType]} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => dispatch({ type: "long-rest-spells", actorId })}>Descanso longo</Button>
          {spellcasting.progressionType === "pact_magic" ? <Button type="button" variant="ghost" onClick={() => dispatch({ type: "short-rest-pact", actorId })}>Descanso curto</Button> : null}
        </div>
      </Card>

      <Card>
        <p className="section-title mb-3">{spellcasting.progressionType === "pact_magic" ? "Magia de Pacto" : "Slots de Magia"}</p>
        {spellcasting.progressionType === "pact_magic" && pact ? (
          <div className="rounded-md border border-antique/30 bg-antique/10 p-3 text-sm text-stone-200">
            Slots: {pact.current}/{pact.max} | Nível do slot: {pact.slotLevel} | Recupera em descanso curto/longo
          </div>
        ) : (
          <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-5">
            {slots.map((slot) => (
              <div key={slot.level} className="rounded-md border border-white/10 bg-black/25 p-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-white">Nível {slot.level}</p>
                  <span className="text-sm text-antique">{slot.current}/{slot.max}</span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Button className="h-8 px-2 text-xs" type="button" variant="ghost" onClick={() => dispatch({ type: "spend-spell-slot", actorId, slotLevel: slot.level })}>Gastar</Button>
                  <Button className="h-8 px-2 text-xs" type="button" variant="ghost" onClick={() => dispatch({ type: "recover-spell-slot", actorId, slotLevel: slot.level })}>Recup.</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <p className="section-title mb-3">Filtros</p>
        <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-6">
          <input className="field" placeholder="Buscar magia" value={query} onChange={(event) => setQuery(event.target.value)} />
          <select className="field" value={levelFilter} onChange={(event) => setLevelFilter(event.target.value)}>
            <option value="all">Todos os níveis</option>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => <option key={level} value={level}>{level === 0 ? "Truque" : `Nível ${level}`}</option>)}
          </select>
          <select className="field" value={schoolFilter} onChange={(event) => setSchoolFilter(event.target.value)}>
            <option value="all">Todas escolas</option>
            {Array.from(new Set(spellcasting.spells.map((spell) => spell.school))).map((school) => <option key={school} value={school}>{school}</option>)}
          </select>
          <select className="field" value={actionFilter} onChange={(event) => setActionFilter(event.target.value)}>
            <option value="all">Todas ações</option>
            {(["action", "bonus_action", "reaction", "ritual", "minute", "hour"] as SpellActionType[]).map((action) => <option key={action} value={action}>{action}</option>)}
          </select>
          <label className="flex items-center gap-2 rounded-md border border-white/10 bg-black/25 px-3 text-sm text-stone-300"><input type="checkbox" checked={concentrationOnly} onChange={(event) => setConcentrationOnly(event.target.checked)} />Concentração</label>
          <label className="flex items-center gap-2 rounded-md border border-white/10 bg-black/25 px-3 text-sm text-stone-300"><input type="checkbox" checked={ritualOnly} onChange={(event) => setRitualOnly(event.target.checked)} />Ritual</label>
          <label className="flex items-center gap-2 rounded-md border border-white/10 bg-black/25 px-3 text-sm text-stone-300"><input type="checkbox" checked={preparedOnly} onChange={(event) => setPreparedOnly(event.target.checked)} />Preparada</label>
        </div>
        <label className="mt-3 block text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
          Alvo
          <select className="field mt-2 max-w-md" value={targetActorId} onChange={(event) => setTargetActorId(event.target.value)}>
            {activeActors.map((target) => target ? <option key={target.id} value={target.id}>{target.name} ({target.hp}/{target.maxHp})</option> : null)}
          </select>
        </label>
      </Card>

      <div>
        <p className="section-title mb-3">Truques</p>
        <div className="grid gap-3 md:grid-cols-2">
          {filteredSpells.filter((spell) => spell.level === 0).map((spell) => <SpellCard key={spell.id} spell={spell} slots={slots} slotBySpell={slotBySpell} setSlotBySpell={setSlotBySpell} cast={cast} details={setSelectedSpell} />)}
        </div>
      </div>

      <div>
        <p className="section-title mb-3">Lista de Magias</p>
        <div className="grid gap-3 md:grid-cols-2">
          {filteredSpells.filter((spell) => spell.level > 0).map((spell) => <SpellCard key={spell.id} spell={spell} slots={slots} slotBySpell={slotBySpell} setSlotBySpell={setSlotBySpell} cast={cast} details={setSelectedSpell} />)}
        </div>
      </div>

      {selectedSpell ? <SpellDetailsModal spell={selectedSpell} onClose={() => setSelectedSpell(null)} /> : null}
    </div>
  );
}

function SpellCard({ spell, slots, slotBySpell, setSlotBySpell, cast, details }: { spell: Spell; slots: ReturnType<typeof useSession>["state"]["spellSlots"][string]; slotBySpell: Record<string, number>; setSlotBySpell: React.Dispatch<React.SetStateAction<Record<string, number>>>; cast: (spell: Spell) => void; details: (spell: Spell) => void }) {
  const availableSlots = slots.filter((slot) => slot.level >= spell.level && slot.max > 0);

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-white">{spell.name}</h3>
          <p className="mt-1 text-xs text-stone-400">{spell.level === 0 ? "Truque" : `Nível ${spell.level}`} | {spell.school}</p>
        </div>
        <StatusChip tone={spell.level === 0 ? "ally" : "arcane"}>{spell.level === 0 ? "Truque" : "Magia"}</StatusChip>
      </div>
      <div className="mt-3 grid gap-2 text-xs text-stone-400 sm:grid-cols-2">
        <span>Tempo: {spell.castingTime}</span>
        <span>Alcance: {spell.range}</span>
        <span>Duração: {spell.duration}</span>
        <span>{spell.concentration ? "Concentração" : "Sem concentração"}{spell.ritual ? " | Ritual" : ""}</span>
      </div>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-stone-200">{spell.description}</p>
      <p className="mt-2 text-xs text-antique">{spell.damageFormula ? `Dano ${spell.damageFormula}` : spell.healingFormula ? `Cura ${spell.healingFormula}` : "Sem dano/cura"} {spell.saveAbility ? `| Resistência ${spell.saveAbility}` : spell.requiresAttackRoll ? "| Ataque mágico" : ""}</p>
      {spell.level > 0 && availableSlots.length ? (
        <select className="field mt-3" value={slotBySpell[spell.id] ?? spell.level} onChange={(event) => setSlotBySpell((current) => ({ ...current, [spell.id]: Number(event.target.value) }))}>
          {availableSlots.map((slot) => <option key={slot.level} value={slot.level}>Slot nível {slot.level} ({slot.current}/{slot.max})</option>)}
        </select>
      ) : null}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button type="button" variant="secondary" onClick={() => cast(spell)}>Conjurar</Button>
        <Button type="button" variant="ghost" onClick={() => details(spell)}>Detalhes</Button>
      </div>
    </Card>
  );
}

function SpellDetailsModal({ spell, onClose }: { spell: Spell; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-antique/30 bg-void p-5 shadow-ember">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="section-title">{spell.level === 0 ? "Truque" : `Magia de nível ${spell.level}`}</p>
            <h2 className="mt-1 text-3xl font-bold text-white">{spell.name}</h2>
          </div>
          <Button type="button" variant="ghost" onClick={onClose}>Fechar</Button>
        </div>
        <div className="mt-4 grid gap-3 text-sm text-stone-300 md:grid-cols-2">
          <Info title="Escola" value={spell.school} />
          <Info title="Tempo" value={spell.castingTime} />
          <Info title="Alcance" value={spell.range} />
          <Info title="Duração" value={spell.duration} />
          <Info title="Concentração" value={spell.concentration ? "Sim" : "Não"} />
          <Info title="Ritual" value={spell.ritual ? "Sim" : "Não"} />
        </div>
        <p className="mt-4 leading-6 text-stone-200">{spell.description}</p>
        {spell.higherLevelDescription ? <p className="mt-3 leading-6 text-stone-300">Em níveis superiores: {spell.higherLevelDescription}</p> : null}
        <p className="mt-3 text-sm text-antique">{spell.damageFormula ? `Dano: ${spell.damageFormula}` : spell.healingFormula ? `Cura: ${spell.healingFormula}` : "Sem dano/cura configurado."}</p>
        <p className="mt-2 text-sm text-stone-400">{spell.saveAbility ? `Resistência: ${spell.saveAbility}` : spell.requiresAttackRoll ? "Usa ataque mágico contra CA." : "Sem ataque/resistência."}</p>
        <p className="mt-2 text-sm text-stone-400">Classes: {spell.sourceClasses.join(", ")}</p>
      </div>
    </div>
  );
}

function Info({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-black/25 p-3">
      <p className="text-xs uppercase tracking-[0.16em] text-stone-500">{title}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
