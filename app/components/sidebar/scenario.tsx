import React from "react";
import clsx from "clsx";
import Link from "next/link";
import { Route } from "@/app/routes";

interface ScenarioProps {
  title: string;
  description: string;
  path: Route;
  badges?: string[];
  className?: string;
}

const Scenario: React.FC<ScenarioProps> = ({
  title,
  description,
  path,
  badges = [],
  className,
}) => {
  return (
    <Link href={path}>
      <div
        className={clsx(
          "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-200 flex flex-col gap-3",
          className
        )}
      >
        <h3 className="font-bold text-gray-900 dark:text-white">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
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
