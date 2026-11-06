import { connection } from "next/server";
import { Suspense } from "react";
import { PageLoading, PageTitle } from "@/components/admin/parts";
import { SeoForm } from "@/components/admin/SeoForm";
import { adminCard } from "@/components/admin/styles";
import { requireAdmin } from "@/lib/admin/auth";
import { getSeo } from "@/lib/seo";

export default function SeoPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Seo />
    </Suspense>
  );
}

async function Seo() {
  await connection();
  await requireAdmin();
  const seo = await getSeo();

  return (
    <>
      <PageTitle title="SEO" hint="რას ხედავენ Google და სხვა საძიებო სისტემები." />

      <section className={`${adminCard} space-y-3 text-sm`}>
        <h2 className="text-lg font-bold">Google Search Console</h2>
        <ol className="list-decimal space-y-1.5 pl-5 text-ink-2">
          <li>გახსენით <a href="https://search.google.com/search-console" target="_blank" rel="noopener" className="font-semibold underline underline-offset-4">Search Console</a> და დაამატეთ საიტი „URL prefix“ ვარიანტით.</li>
          <li>აირჩიეთ „HTML tag“, დააკოპირეთ ტეგი და ჩასვით ქვემოთ, „საიტის დადასტურებაში“. შეინახეთ და Google-ში დააჭირეთ Verify-ს.</li>
          <li>Sitemaps განყოფილებაში დაამატეთ ეს მისამართი:</li>
        </ol>
        <dl className="grid gap-2 rounded-2xl bg-surface-2 p-4">
          <div>
            <dt className="text-xs text-muted">Sitemap</dt>
            <dd className="break-all font-semibold">{seo.siteUrl}/sitemap.xml</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Robots</dt>
            <dd className="break-all font-semibold">{seo.siteUrl}/robots.txt</dd>
          </div>
        </dl>
      </section>

      <SeoForm seo={seo} />
    </>
  );
}
