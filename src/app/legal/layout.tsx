import { DocsShell } from "@/components/layout/DocsShell";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DocsShell>{children}</DocsShell>;
}
