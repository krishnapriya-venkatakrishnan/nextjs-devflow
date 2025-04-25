"use server";

import { filterProps, getCountriesProps } from "@/types/action";

export async function getJobLocation(): Promise<{
  filters: filterProps[];
  sortedFlags: Record<string, string>;
}> {
  // fetch the countries list
  // return 2 values.
  // 1. an array of objects- name and value pair- for filter
  // 2. an object- countryName and countryFlag- for displaying the flag in the job listing card.
  const filters: filterProps[] = [];
  const flags: Record<string, string> = {};

  const res = await fetch(
    `https://restcountries.com/v3.1/all?fields=name,flags`
  );
  const data = await res.json();
  await Promise.all(
    data.map((item: getCountriesProps) => {
      filters.push({
        name: item.name.common,
        value: item.name.common,
      });

      flags[item.name.common] = item.flags.png;
    })
  );

  filters.sort((a: filterProps, b: filterProps) =>
    a.name.localeCompare(b.name)
  );
  const sortedFlags: Record<string, string> = Object.fromEntries(
    Object.entries(flags).sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
  );

  return {
    filters,
    sortedFlags,
  };
}
