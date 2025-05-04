import JobListingCard from "@/components/cards/JobListingCard";
import DataRenderer from "@/components/DataRenderer";
import CommonFilter from "@/components/filters/CommonFilter";
import Pagination from "@/components/Pagination";
import LocalSearch from "@/components/search/LocalSearch";
import ROUTES from "@/constants/routes";
import { EMPTY_JOBS } from "@/constants/states";
import { getJobFilters, getJobListings } from "@/lib/actions/job.action";
import { RouteParams } from "@/types/global";

const FindJobs = async ({ searchParams }: RouteParams) => {
  const { page, pageSize, query, filter } = await searchParams;
  const { listings: municipalityListings } = await getJobListings({
    page: Number(page) || 1,
    pageSize: 10,
  });
  const municipalitiesArray = municipalityListings.map(
    (item) => item.workplace_address.municipality
  );
  const sortedMunicipalitiesArray = [...new Set(municipalitiesArray)];
  const jobFilterLocations = await getJobFilters(sortedMunicipalitiesArray);

  const { listings, isNext } = await getJobListings({
    page: Number(page) || 1,
    pageSize: 10,
    filter,
    query,
  });

  return (
    <section>
      <h1 className="text-4xl font-bold">Jobs in Sweden</h1>
      <div className="flex max-md:flex-col gap-6 mt-6">
        <LocalSearch
          route={ROUTES.JOBS}
          imgSrc="/icons/search.svg"
          placeholder="Search in ad headline, ad description and employer name"
          otherClasses="pl-6"
        />
        {jobFilterLocations && (
          <CommonFilter
            filters={jobFilterLocations}
            otherClasses="min-h-[56px] sm:min-w-[170px]"
            containerClasses="flex"
            jobFilter={true}
          />
        )}
      </div>
      <DataRenderer
        success={true}
        data={listings}
        empty={EMPTY_JOBS}
        render={(listings) => (
          <div className="mt-10 flex w-full flex-col gap-6">
            {listings.map(
              (
                {
                  logo_url,
                  headline,
                  description,
                  employment_type,
                  salary_type,
                  workplace_address,
                  webpage_url,
                },
                index
              ) => (
                <JobListingCard
                  key={index}
                  logo={logo_url}
                  title={headline}
                  description={description.text}
                  type={employment_type.label}
                  salary={salary_type.label}
                  municipality={workplace_address.municipality}
                  region={workplace_address.region}
                  href={webpage_url}
                />
              )
            )}
          </div>
        )}
      />

      <Pagination page={page} isNext={isNext || false} />
    </section>
  );
};

export default FindJobs;
