import Image from "next/image";
import Link from "next/link";
import React from "react";

interface Props {
  logo?: string;
  title: string;
  description: string;
  type: string;
  salary: string;
  municipality: string;
  region: string;
  href: string;
}

const JobListingCard = ({
  logo,
  title,
  description,
  type,
  salary,
  municipality,
  region,
  href,
}: Props) => {
  return (
    <div className="card-wrapper rounded-2.5 p-9 sm:px-11 flex flex-col gap-4">
      <div className="flex justify-end gap-2">
        {`${municipality}, ${region}`}
      </div>
      <div className="flex-1 ">
        {logo && (
          <Image
            src={logo}
            alt="job logo"
            height={70}
            width={70}
            className="dark:border-white dark:bg-white dark:p-1"
          />
        )}
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
              src="/icons/clock-2.svg"
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
        <Link
          href={href}
          target="_blank"
          className="text-primary-100 mr-4 gap-2 flex py-6"
        >
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
