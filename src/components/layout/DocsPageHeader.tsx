interface DocsPageHeaderProps {
  title: string;
  subtitle?: string;
  meta?: string;
}

export function DocsPageHeader({ title, subtitle, meta }: DocsPageHeaderProps) {
  return (
    <header className="text-center space-y-2.5 pb-8 mb-8 border-b border-gray-200">
      <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
        {title}
      </h1>
      {meta && (
        <p className="text-sm font-medium text-gray-800">{meta}</p>
      )}
      {subtitle && (
        <p className="text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </header>
  );
}

