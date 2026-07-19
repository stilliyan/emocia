"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { saveSiteContent, saveSiteSettings } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SiteContent, SiteSettings } from "@/lib/data";

const textProps = { spellCheck: false, autoCorrect: "off" as const, autoCapitalize: "off" as const };
const value = (input: string | null | undefined) => input ?? "";

export function SimpleSettingsForm(props: { kind: "settings"; initialValues: SiteSettings } | { kind: "content"; initialValues: SiteContent }) {
  return props.kind === "settings" ? <SettingsForm initialValues={props.initialValues} /> : <ContentForm initialValues={props.initialValues} />;
}

function SettingsForm({ initialValues }: { initialValues: SiteSettings }) {
  const [state, action, pending] = useActionState(saveSiteSettings, null);
  const [seoTitle, setSeoTitle] = useState(value(initialValues.default_seo_title));
  const [metaDescription, setMetaDescription] = useState(value(initialValues.default_meta_description));
  useFeedback(state);

  return <form action={action} noValidate className="space-y-5">
    <Section title="Магазин" description="Основните данни, с които магазинът се представя пред клиентите.">
      <div className="grid gap-4 md:grid-cols-2">
        <Field id="shop_name" label="Име на магазина"><Input id="shop_name" name="shop_name" defaultValue={initialValues.shop_name} required {...textProps} /></Field>
        <Field id="working_hours" label="Работно време"><Input id="working_hours" name="working_hours" defaultValue={value(initialValues.working_hours)} {...textProps} /></Field>
        <div className="md:col-span-2"><Field id="address" label="Адрес"><Input id="address" name="address" defaultValue={value(initialValues.address)} {...textProps} /></Field></div>
      </div>
    </Section>

    <Section title="Контакти" description="Телефонът и имейлът са единният източник за контактните данни на сайта.">
      <div className="grid gap-4 md:grid-cols-2">
        <Field id="contact_phone" label="Телефон"><Input id="contact_phone" name="contact_phone" type="tel" defaultValue={value(initialValues.contact_phone)} /></Field>
        <Field id="contact_email" label="Имейл"><Input id="contact_email" name="contact_email" type="email" defaultValue={value(initialValues.contact_email)} /></Field>
      </div>
    </Section>

    <Section title="Социални мрежи и локация" description="Връзки към профилите на магазина и неговата позиция в Google Maps.">
      <div className="grid gap-4 md:grid-cols-2">
        <Field id="instagram_url" label="Instagram адрес"><Input id="instagram_url" name="instagram_url" type="url" defaultValue={value(initialValues.instagram_url)} {...textProps} /></Field>
        <Field id="facebook_url" label="Facebook адрес"><Input id="facebook_url" name="facebook_url" type="url" defaultValue={value(initialValues.facebook_url)} {...textProps} /></Field>
        <div className="md:col-span-2"><Field id="maps_url" label="Google Maps адрес"><Input id="maps_url" name="maps_url" type="url" defaultValue={value(initialValues.maps_url)} {...textProps} /></Field></div>
      </div>
    </Section>

    <Section title="SEO по подразбиране" description="Използва се, когато конкретна страница няма собствено SEO заглавие или описание.">
      <div className="grid gap-4">
        <CountedInput id="default_seo_title" label="SEO заглавие по подразбиране" value={seoTitle} onChange={setSeoTitle} maxLength={60} />
        <CountedTextarea id="default_meta_description" label="Мета описание по подразбиране" value={metaDescription} onChange={setMetaDescription} maxLength={160} />
      </div>
    </Section>
    <StickyActions pending={pending} />
  </form>;
}

function ContentForm({ initialValues }: { initialValues: SiteContent }) {
  const [state, action, pending] = useActionState(saveSiteContent, null);
  useFeedback(state);
  return <form action={action} noValidate className="space-y-5">
    <Section title="Начална секция" description="Текстовете в основната секция, която посетителите виждат първо.">
      <div className="grid gap-4">
        <Field id="hero_title" label="Заглавие на началната секция"><Input id="hero_title" name="hero_title" defaultValue={value(initialValues.hero_title)} {...textProps} /></Field>
        <Field id="hero_description" label="Описание на началната секция"><Textarea id="hero_description" name="hero_description" defaultValue={value(initialValues.hero_description)} rows={4} {...textProps} /></Field>
      </div>
    </Section>
    <Section title="За нас" description="Представяне на бутика и неговия подход към клиентите.">
      <div className="grid gap-4">
        <Field id="about_title" label="Заглавие „За нас“"><Input id="about_title" name="about_title" defaultValue={value(initialValues.about_title)} {...textProps} /></Field>
        <Field id="about_content" label="Текст „За нас“"><Textarea id="about_content" name="about_content" defaultValue={value(initialValues.about_content)} rows={7} {...textProps} /></Field>
      </div>
    </Section>
    <StickyActions pending={pending} />
  </form>;
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <Card className="[--card-spacing:--spacing(4)]"><CardHeader className="gap-1"><CardTitle>{title}</CardTitle><p className="text-sm leading-5 text-muted-foreground">{description}</p></CardHeader><CardContent>{children}</CardContent></Card>;
}

function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label>{children}{hint && <p id={`${id}-hint`} className="text-xs text-muted-foreground">{hint}</p>}</div>;
}

function CountedInput({ id, label, value: current, onChange, maxLength }: { id: string; label: string; value: string; onChange: (value: string) => void; maxLength: number }) {
  return <Field id={id} label={label}><Input id={id} name={id} value={current} maxLength={maxLength} onChange={(event) => onChange(event.target.value)} aria-describedby={`${id}-count`} {...textProps} /><Counter id={`${id}-count`} count={current.length} max={maxLength} /></Field>;
}

function CountedTextarea({ id, label, value: current, onChange, maxLength }: { id: string; label: string; value: string; onChange: (value: string) => void; maxLength: number }) {
  return <Field id={id} label={label}><Textarea id={id} name={id} value={current} maxLength={maxLength} onChange={(event) => onChange(event.target.value)} aria-describedby={`${id}-count`} {...textProps} /><Counter id={`${id}-count`} count={current.length} max={maxLength} /></Field>;
}

function Counter({ id, count, max }: { id: string; count: number; max: number }) {
  return <p id={id} className="text-right text-xs tabular-nums text-muted-foreground">{count}/{max}</p>;
}

function StickyActions({ pending }: { pending: boolean }) {
  return <div className="flex justify-end rounded-lg border bg-background/95 p-3 shadow-sm backdrop-blur-sm md:sticky md:bottom-4 md:z-10"><Button type="submit" disabled={pending}>{pending ? "Запазване…" : "Запази промените"}</Button></div>;
}

function useFeedback(state: { error?: string; success?: string } | null) {
  useEffect(() => { if (state?.error) toast.error(state.error); if (state?.success) toast.success(state.success); }, [state]);
}
