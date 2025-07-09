"use client";

import React from "react";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Route } from "@/app/routes";

type Badge =
  | "Tools"
  | "Authorization"
  | "MCP"
  | "RAG"
  | "Vector Search"
  | "Multi-Agent"
  | "Pinecone"
  | "Long-running tasks";

interface ScenarioProps {
  title: string;
  description: string;
  path: Route;
  badges?: Badge[];
  className?: string;
}

const Scenario: React.FC<ScenarioProps> = ({
  title,
  description,
  path,
  badges = [],
  className,
}) => {
  const pathname = usePathname();
  const isSelected = pathname === path;

  return (
    <Link href={path}>
      <div
        className={clsx(
          "border rounded-lg p-4 cursor-pointer transition-colors duration-200 flex flex-col gap-3",
          {
            // Selected state
            "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700":
              isSelected,
            // Default state
            "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600":
              !isSelected,
          },
          className
        )}
      >
        <h3
          className={clsx("font-bold", {
            "text-blue-900 dark:text-blue-100": isSelected,
            "text-gray-900 dark:text-white": !isSelected,
          })}
        >
          {title}
        </h3>
        <p
          className={clsx("text-sm leading-relaxed", {
            "text-blue-700 dark:text-blue-200": isSelected,
            "text-gray-600 dark:text-gray-300": !isSelected,
          })}
        >
          {description}
        </p>
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {badges.map((badge, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              >
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
};

export default Scenario;
