import Link from "next/link";

type Breadcrumb = {
  label: string;
  href: string;
};

export default function Breadcrumbs({ items }: { items: Breadcrumb[] }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol className="breadcrumbs-list">
        {items.map((item, index) => (
          <li key={item.href} className="breadcrumbs-item">
            {index < items.length - 1 ? (
              <>
                <Link href={item.href}>{item.label}</Link>
                <span className="breadcrumbs-separator">/</span>
              </>
            ) : (
              <span className="breadcrumbs-current" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
