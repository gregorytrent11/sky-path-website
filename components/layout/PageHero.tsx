export default function PageHero({
  title,
  intro,
}: {
  title: string;
  intro?: string;
}) {
  return (
    <section className="bg-brand-soft-blue/30">
      <div className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6">
        <h1 className="font-heading text-4xl font-semibold text-brand-deep-blue">{title}</h1>
        {intro && (
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-brand-charcoal">
            {intro}
          </p>
        )}
      </div>
    </section>
  );
}
