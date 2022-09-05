type ForEachProps<T> = {
  items: Array<T>;
  children: (item: T) => React.ReactNode;
};

export function ForEach<T>({ items, children }: ForEachProps<T>) {
  if (items.length === 0) return null;

  return <>{items.map((item) => children(item))}</>;
}
