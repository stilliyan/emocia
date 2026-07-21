export const publicNavigation = [
  { label: "Начало", href: "/" },
  { label: "Булчински рокли", href: "/bulchinski-rokli" },
  { label: "Официални рокли", href: "/oficialni-rokli" },
  { label: "Аксесоари", href: "/aksesoari" },
  { label: "Галерия", href: "/galeriya" },
  { label: "Съвети за булката", href: "/blog" },
  { label: "Контакти", href: "/kontakti" },
] as const;

export function isPublicNavigationActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";

  return pathname === href || pathname.startsWith(`${href}/`);
}
