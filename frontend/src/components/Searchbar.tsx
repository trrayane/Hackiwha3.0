import React from "react";
import type { ChangeEvent } from "react";
import { Search, Sun, Moon, Bell } from "lucide-react";

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Called when the theme toggle button is clicked */
  onToggleTheme?: () => void;
  /** Called when the notifications bell is clicked */
  onNotificationsClick?: () => void;
}

/**
 * SearchBar
 * Pill-shaped top bar: search input on the left, theme toggle +
 * notifications button on the right.
 */
export default function SearchBar({
  value,
  onChange,
  placeholder = "Search for jingles",
  onToggleTheme,
  onNotificationsClick,
}: SearchBarProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    onChange(e.target.value);
  };

  return (
    <div className="flex items-center justify-between rounded-full border border-gray-100 bg-white px-6 py-3 shadow-sm">
      <div className="flex w-1/2 items-center text-gray-400">
        <Search className="mr-3 h-5 w-5" aria-hidden="true" />
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full bg-transparent text-gray-700 placeholder-gray-400 outline-none"
        />
      </div>

      <div className="flex items-center space-x-3">
        <div className="flex rounded-full border border-gray-200 bg-gray-50 p-1">
          <button
            type="button"
            aria-label="Dark mode"
            className="rounded-full p-2 text-gray-400 hover:text-gray-700"
          >
            <Moon className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Light mode"
            className="rounded-full bg-white p-2 text-gray-700 shadow-sm"
          >
            <Sun className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <button
          type="button"
          onClick={onNotificationsClick}
          aria-label="Notifications"
          className="rounded-full border border-gray-200 bg-white p-3 text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}