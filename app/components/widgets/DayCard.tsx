"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Clock, MapPin } from "lucide-react";
import { useState } from "react";
import type { Day } from "@lib/types";

interface DayCardProps {
  day: Day;
  className?: string;
}

export default function DayCard({ day, className = "" }: DayCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className={`space-y-4 p-6 ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-4 text-left transition-all hover:from-blue-100 hover:to-blue-200"
      >
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Day {day.day}</h3>
          <p className="mt-1 text-sm text-gray-600">
            {day.activities.length} activities planned
          </p>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-6 w-6 text-gray-600" />
        </motion.div>
      </button>

      {day.summary && (
        <p className="text-sm italic text-gray-600">{day.summary}</p>
      )}

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3 overflow-hidden"
          >
            {day.activities.map((activity, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                className="relative rounded-xl border border-gray-100 bg-gray-50 p-4 transition-all hover:border-blue-200 hover:bg-blue-50"
              >
                <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-blue-500" />
                <div className="pl-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-gray-900">
                      {activity.title}
                    </h4>
                    <div className="flex shrink-0 items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <Clock className="h-3 w-3" />
                      {activity.time}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    {activity.location}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
