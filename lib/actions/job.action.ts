"use server";

import {
  FilterProps,
  GetJobListingsProps,
  GetMunicipalitiesProps,
} from "@/types/action";
import { PaginatedSearchParams } from "@/types/global";
import { cache } from "react";

const getMunicipalitiesApi = cache(async function getMunicipalitiesApi() {
  const res = await fetch(
    `https://taxonomy.api.jobtechdev.se/v1/taxonomy/specific/concepts/municipality`,
    {
      next: {
        revalidate: 86400,
      },
    }
  );
  const data = await res.json();
  return data;
});

export async function getMunicipalities(): Promise<{
  filters: FilterProps[];
}> {
  const filters: FilterProps[] = [];

  const data = await getMunicipalitiesApi();
  await Promise.all(
    data.map((item: GetMunicipalitiesProps) => {
      filters.push({
        name: item["taxonomy/definition"],
        value: item["taxonomy/id"],
      });
    })
  );

  filters.sort((a: FilterProps, b: FilterProps) =>
    a.name.localeCompare(b.name)
  );

  return {
    filters,
  };
}

const callJobListingsApi = cache(async function callJobListingsApi(
  pageSize: number,
  offset: number,
  query?: string,
  filter?: string
) {
  let searchString = `limit=${pageSize}&offset=${offset}`;

  if (query) searchString += `&q=${query}`;

  if (filter) searchString += `&municipality=${filter}`;

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
