export function PromoSkeleton() {
  return (
    <section
      aria-hidden="true"
      className="border-b border-border-100 bg-bg-200 py-5"
    >
      <div className="container">
        <div className="skeleton h-[72px]" />
      </div>
    </section>
  );
}
