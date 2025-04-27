"use server";

import { FilterProps, GetJobListingsProps } from "@/types/action";
import { PaginatedSearchParams } from "@/types/global";
import { cache } from "react";

async function getMunicipality(municipality: string): Promise<string> {
  const res = await fetch(
    `https://taxonomy.api.jobtechdev.se/v1/taxonomy/specific/concepts/municipality?preferred-label=${municipality}`,
    {
      next: {
        revalidate: 86400,
      },
    }
  );
  const data = await res.json();
  return data[0]["taxonomy/id"];
}

export async function getJobFilters(
  municipalityArray: string[]
): Promise<FilterProps[]> {
  const result = await Promise.all(
    municipalityArray.map(async (item) => {
      return {
        name: item,
        value: await getMunicipality(item),
      };
    })
  );
  return [{ name: "All", value: "all" }, ...result];
}

const callJobListingsApi = cache(async function callJobListingsApi(
  pageSize: number,
  offset: number,
  query?: string,
  filter?: string
) {
  let searchString = `limit=${pageSize}&offset=${offset}`;

  if (query) searchString += `&q=${query}`;

  if (filter && filter !== "all") searchString += `&municipality=${filter}`;

  const url = `https://jobsearch.api.jobtechdev.se/search?${searchString}`;

  try {
    const response = await fetch(url);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
  }
});

export async function getJobListings(params: PaginatedSearchParams): Promise<{
  listings: GetJobListingsProps[];
  isNext: boolean;
}> {
  const { page, pageSize, filter, query } = params;
  const offset = (page! - 1) * 10;
  const data = await callJobListingsApi(pageSize!, offset, query, filter);

  return {
    listings: data.hits,
    isNext: data.total.value > page! * 10,
  };
}
