import JobListingCard from "@/components/cards/JobListingCard";
import CommonFilter from "@/components/filters/CommonFilter";
import Pagination from "@/components/Pagination";
import LocalSearch from "@/components/search/LocalSearch";
import ROUTES from "@/constants/routes";
import { getMunicipalities, getJobListings } from "@/lib/actions/job.action";
import { RouteParams } from "@/types/global";

const FindJobs = async ({ searchParams }: RouteParams) => {
  const { filters: jobFilterLocations } = await getMunicipalities();

  const { page, pageSize, query, filter } = await searchParams;
  const { listings, isNext } = await getJobListings({
    page: Number(page) || 1,
    pageSize: 10,
    filter,
    query,
  });

  return (
    <section>
      <h1 className="text-4xl font-bold">Jobs in Sweden</h1>
      <div className="flex max-md:flex-col gap-6">
        <LocalSearch
          route={ROUTES.JOBS}
          imgSrc="/icons/search.svg"
          placeholder="Job Title, Company, or Keywords"
          otherClasses=" pl-6"
        />
        <CommonFilter
          filters={jobFilterLocations}
          otherClasses="min-h-[56px] sm:min-w-[170px]"
          containerClasses="flex"
          jobFilter={true}
        />
      </div>
      <div className="flex flex-col gap-10 mt-10 px-6">
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

      <Pagination page={page} isNext={isNext || false} />
    </section>
  );
};

export default FindJobs;
