"use client";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

import { formUrlQuery, removeKeysFromUrlQuery } from "@/lib/url";

import { Input } from "../ui/input";
import { performGlobalSearch } from "@/lib/actions/global.action";
import { GlobalFilters } from "@/constants/filters";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Props {
  imgSrc: string;
  placeholder: string;
}

const GlobalSearch = ({ imgSrc, placeholder }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const global = searchParams.get("global") || "";
  const [searchGlobal, setSearchGlobal] = useState(global);
  const globaleRef = useRef<HTMLDivElement>(null);

  const typeParams = searchParams.get("type");
  const [active, setActive] = useState(typeParams || "");
  const types = GlobalFilters;

  const [searchResults, setSearchResults] = useState([
    { content: "", category: "", href: "" },
  ]);
  const [loading, setLoading] = useState(true);

  const fetchData = async (query: string, type: string) => {
    setLoading(true);
    const { success, data } = await performGlobalSearch({
      global: query,
      type: type,
    });

    if (success && data?.length) setSearchResults(data);
    else setSearchResults([]);

    setLoading(false);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchGlobal) {
        const newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: "global",
          value: searchGlobal,
        });
        router.push(newUrl, { scroll: false });
      } else {
        setActive("");
        setSearchResults([{ content: "", category: "", href: "" }]);
        const newUrl = removeKeysFromUrlQuery({
          params: searchParams.toString(),
          keysToRemove: ["global", "type"],
        });
        router.push(newUrl, { scroll: false });
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchGlobal, pathname, router, searchParams]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchGlobal) {
        fetchData(searchGlobal, active);
      } else {
        setLoading(true);
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchGlobal, active]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        globaleRef.current &&
        !globaleRef.current.contains(event.target as Node)
      ) {
        setSearchGlobal("");
      }
    };

    // Important: { capture: true }
    // Because sometimes Input and inner elements prevent the event from bubbling properly - capture phase ensures the click is caught before it reaches the input.
    document.addEventListener("mousedown", handleClickOutside, {
      capture: true,
    });

    return () => {
      document.removeEventListener("mousedown", handleClickOutside, {
        capture: true,
      });
    };
  }, []);

  const handleTypeClick = (type: string) => {
    let newUrl = "";

    if (type === active) {
      setActive("");

      newUrl = removeKeysFromUrlQuery({
        params: searchParams.toString(),
        keysToRemove: ["type"],
      });
    } else {
      setActive(type);

      newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: "type",
        value: type.toLowerCase(),
      });
    }
    router.push(newUrl, { scroll: false });
  };

  return (
    <div
      className={`relative background-light800_darkgradient flex flex-col min-h-[56px] grow items-center gap-4 rounded-2.5 px-4 flex-1 max-w-[700px]`}
      ref={globaleRef}
    >
      <div className="w-full flex items-center pt-2">
        <Image
          src={imgSrc}
          alt="Search"
          width={24}
          height={24}
          className="cursor-pointer"
        />

        <Input
          type="text"
          placeholder={placeholder}
          value={searchGlobal}
          onChange={(e) => setSearchGlobal(e.target.value)}
          className="paragraph-regular no-focus placeholder text-dark400_light700 border-none shadow-none outline-none"
        />
      </div>
      {searchGlobal && (
        <div className="absolute top-20 background-light800_dark400 w-full min-h-[56px] flex flex-col rounded-2xl">
          <div className="flex items-center justify-between p-4 ">
            <p>Type:</p>
            <div className="hidden flex-wrap gap-3 sm:flex">
              {types.map((type) => (
                <Button
                  key={type.name}
                  className={cn(
                    `body-medium rounded-full px-6 py-3 capitalize shadow-none`,
                    active === type.value
                      ? "bg-primary-500 text-primary-100 hover:bg-primary-500 dark:bg-dark-400 dark:text-primary-100 dark:hover:bg-dark-400"
                      : "bg-light-500 text-dark-300 hover:bg-light-800 dark:bg-dark-300 dark:text-light-500 dark:hover:bg-dark-300"
                  )}
                  onClick={() => handleTypeClick(type.value)}
                >
                  {type.name}
                </Button>
              ))}
            </div>
          </div>
          {loading ? (
            <div className="p-4 text-center italic">
              Searching the database...
            </div>
          ) : searchResults.length === 0 ? (
            <div className="p-4 text-center">No match found</div>
          ) : (
            searchResults[0].content && (
              <div className=" ">
                <div className="p-4 mb-4 text-xl font-bold border-t-2 border-t-slate-300 dark:border-t-slate-500">
                  Top Match
                </div>
                {searchResults.map((result, index) => (
                  <Link
                    href={result.href}
                    key={index}
                    onClick={() => setSearchGlobal("")}
                  >
                    <div className="flex items-center gap-6 py-4 hover:shadow-sm">
                      <Image
                        src="/icons/tag.svg"
                        alt="tag"
                        height={20}
                        width={20}
                        className="ml-4 hidden dark:block"
                      />
                      <Image
                        src="/icons/tag-light.svg"
                        alt="tag"
                        height={20}
                        width={20}
                        className="ml-4 block dark:hidden"
                      />
                      <div className="flex flex-col gap-2">
                        <p>{result.content}</p>
                        <p className="body-medium rounded-full py-2 capitalize shadow-none text-light-500 w-fit">
                          {result.category}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
