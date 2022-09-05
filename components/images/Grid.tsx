import { ForEach } from "../utils/ForEach";
import { Item } from "./Item";
import type { TItem } from "./Item";

type GridProps = {
  items: TItem[];
};

export function Grid({ items }: GridProps) {
  return (
    <div className="grid grid-flow-row-dense auto-rows-[200px] grid-cols-2 gap-4 overflow-scroll md:grid-cols-3 lg:grid-cols-4 ">
      <ForEach items={items}>
        {(item) => <Item key={item.id} {...item} />}
      </ForEach>
    </div>
  );
}
