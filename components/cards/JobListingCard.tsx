import Image from "next/image";
import Link from "next/link";
import React from "react";

interface Props {
  logo: string;
  title: string;
  description: string;
  type: string;
  salary: string;
  city: string;
  state: string;
  country: string;
  flag: string;
  href: string;
}

const JobListingCard = ({
  logo,
  title,
  description,
  type,
  salary,
  city,
  state,
  country,
  flag,
  href,
}: Props) => {
  return (
    <div className="flex flex-col gap-4 shadow-md px-4">
      <div className="flex justify-end gap-2">
        {flag && (
          <Image
            src={flag}
            alt={country}
            height={10}
            width={25}
            className="rounded-full"
          />
        )}
        {city
          ? state
            ? `${city}, ${state}, ${country}`
            : `${city}, ${country}`
          : state
            ? `${state}, ${country}`
            : `${country}`}
      </div>
      <div className="flex-1">
        <Image src={logo} alt="job logo" height={70} width={70} />
      </div>
      <div className="text-xl font-bold">{title}</div>
      <div>
        {description.slice(120)
          ? `${description.slice(0, 120)}...`
          : description}
      </div>
      <div className="flex items-center justify-between flex-wrap">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Image
              src="/icons/clock.svg"
              alt="job logo"
              height={24}
              width={24}
            />
            {type}
          </div>
          <div className="flex items-center gap-2">
            <Image
              src="/icons/currency-dollar-circle.svg"
              alt="job logo"
              height={24}
              width={24}
            />
            {salary}
          </div>
        </div>
        <Link href={href} className="text-primary-100 mr-4 gap-2 flex py-6">
          View job
          <Image
            src="/icons/arrow-up-right.svg"
            alt="job logo"
            height={24}
            width={24}
          />
        </Link>
      </div>
    </div>
  );
};

export default JobListingCard;
