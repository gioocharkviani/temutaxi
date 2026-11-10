import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { PageLoading, PageTitle } from "@/components/admin/parts";
import { PromotionForm, type PromotionFormValues } from "@/components/admin/PromotionForm";
import { requireAdmin } from "@/lib/admin/auth";
import { COLOR_PRESETS, toTbilisiInput } from "@/lib/promotion-schema";
import { getPromotion } from "@/lib/promotions";

export default function EditPromotionPage({ params }: PageProps<"/admin/promotions/[id]">) {
  return (
    <Suspense fallback={<PageLoading />}>
      <EditPromotion params={params} />
    </Suspense>
  );
}

const empty = { title: "", body: "", buttonText: "" };

async function EditPromotion({ params }: { params: PageProps<"/admin/promotions/[id]">["params"] }) {
  await connection();
  await requireAdmin();
  const { id } = await params;

  let initial: PromotionFormValues;
  if (id === "new") {
    initial = {
      id: null,
      name: "",
      type: "banner",
      theme: "solid",
      enabled: false,
      priority: 0,
      startsAt: "",
      endsAt: "",
      colors: COLOR_PRESETS[0].colors,
      icon: "gift",
      link: "/register",
      newTab: false,
      content: { ka: { ...empty }, en: { ...empty }, ru: { ...empty } },
      repeat: "hours",
      repeatHours: 24,
    };
  } else {
    const p = Number.isInteger(Number(id)) ? await getPromotion(Number(id)) : null;
    if (!p) notFound();
    initial = {
      id: p.id,
      name: p.name,
      type: p.type,
      theme: p.theme,
      enabled: p.enabled,
      priority: p.priority,
      startsAt: toTbilisiInput(p.startsAt),
      endsAt: toTbilisiInput(p.endsAt),
      colors: p.colors,
      icon: p.icon ?? "",
      link: p.link ?? "",
      newTab: p.newTab,
      content: { ka: { ...empty, ...p.content.ka }, en: { ...empty, ...p.content.en }, ru: { ...empty, ...p.content.ru } },
      repeat: p.repeat,
      repeatHours: p.repeatHours,
    };
  }

  return (
    <>
      <PageTitle title={initial.id ? `პრომოუშენი: ${initial.name}` : "ახალი პრომოუშენი"} />
      <PromotionForm initial={initial} />
    </>
  );
}
