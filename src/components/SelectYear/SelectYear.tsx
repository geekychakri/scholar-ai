import * as React from "react";
import { useRouter } from "next/router";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function getLastTenYears() {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 11 }, (_, i) => currentYear - i);
}

export default function SelectScrollable() {
  const [value, setValue] = React.useState("");
  const router = useRouter();

  return (
    <Select
      onValueChange={(val) => {
        if (val === "Any year") {
          router.push(`/papers?q=${router.query.q}`, undefined, {
            shallow: true,
          });
          setValue(val);
          return;
        }
        router.push(`/papers?q=${router.query.q}&year=${val}`, undefined, {
          shallow: true,
        });
        setValue(val);
      }}
    >
      <SelectTrigger className="w-[280px] max-sm:w-full">
        <SelectValue placeholder="Published year:">
          {`Published year: ${value}`}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup
          ref={(ref) =>
            ref?.addEventListener("touchend", (e) => {
              e.preventDefault();
            })
          }
        >
          <SelectItem value="Any year">Any year</SelectItem>
          {getLastTenYears().map((item, i) => (
            <SelectItem key={i} value={item.toString()}>
              {item}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
