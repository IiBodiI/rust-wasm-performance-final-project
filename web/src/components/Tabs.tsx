interface TabOption<T extends string> {
  value: T;
  label: string;
}

interface TabsProps<T extends string> {
  label: string;
  options: TabOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function Tabs<T extends string>({ label, options, value, onChange }: TabsProps<T>) {
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {options.map((option) => (
        <button
          aria-selected={option.value === value}
          className="tab"
          key={option.value}
          onClick={() => onChange(option.value)}
          role="tab"
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

