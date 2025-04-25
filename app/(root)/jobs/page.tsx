import JobListingCard from "@/components/cards/JobListingCard";
import CommonFilter from "@/components/filters/CommonFilter";
import LocalSearch from "@/components/search/LocalSearch";
import ROUTES from "@/constants/routes";
import { getCountries } from "@/lib/actions/job.action";

const FindJobs = async () => {
  const jobListings = [
    {
      logo: "/images/site-logo.svg",
      title: "Seasonal Team Member",
      description:
        "As a team member, you're fully immersed in the spirit of the establishment. You're high functioning, adaptable, and ready",
      type: "Full-time",
      salary: "Not disclosed",
      // location: "Vienna, Virginia, US",
      city: "Vienna",
      state: "Virginia",
      country: "United States",
      href: ROUTES.JOBS,
    },
    {
      logo: "/images/site-logo.svg",
      title: "Seasonal Team Member",
      description:
        "As a team member, you're fully immersed in the spirit of the establishment. You're high functioning, adaptable, and ready",
      type: "Full-time",
      salary: "Not disclosed",
      // location: "Vienna, Virginia, US",
      city: "Vienna",
      state: "Virginia",
      country: "United States",
      href: ROUTES.JOBS,
    },
    {
      logo: "/images/site-logo.svg",
      title: "Seasonal Team Member",
      description:
        "As a team member, you're fully immersed in the spirit of the establishment. You're high functioning, adaptable, and ready",
      type: "Full-time and Part-time",
      salary: "Not disclosed",
      // location: "Vienna, Virginia, US",
      city: "Vienna",
      state: "Virginia",
      country: "United States",
      href: ROUTES.JOBS,
    },
  ];

  const { filters: jobFilterLocations, sortedFlags: flagDetails } =
    await getCountries();

  return (
    <section>
      <h1 className="text-4xl font-bold">Jobs</h1>
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
        {jobListings.map(
          (
            {
              logo,
              title,
              description,
              type,
              salary,
              city,
              state,
              country,
              href,
            },
            index
          ) => (
            <JobListingCard
              key={index}
              logo={logo}
              title={title}
              description={description}
              type={type}
              salary={salary}
              city={city}
              state={state}
              country={country}
              flag={flagDetails[country]}
              href={href}
            />
          )
        )}
      </div>
    </section>
  );
};

export default FindJobs;
