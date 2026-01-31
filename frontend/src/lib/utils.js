import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const STATUS_CONFIG = {
  new: { label: 'New', color: 'bg-blue-500', textColor: 'text-blue-700', bgLight: 'bg-blue-100' },
  in_progress: { label: 'In Progress', color: 'bg-yellow-500', textColor: 'text-yellow-700', bgLight: 'bg-yellow-100' },
  resolved: { label: 'Resolved', color: 'bg-green-500', textColor: 'text-green-700', bgLight: 'bg-green-100' },
  closed: { label: 'Closed', color: 'bg-gray-500', textColor: 'text-gray-700', bgLight: 'bg-gray-100' },
}

export const PRIORITY_CONFIG = {
  urgent: { label: 'Urgent', color: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-100' },
  high: { label: 'High', color: 'bg-orange-500', textColor: 'text-orange-700', bgLight: 'bg-orange-100' },
  medium: { label: 'Medium', color: 'bg-yellow-500', textColor: 'text-yellow-700', bgLight: 'bg-yellow-100' },
  low: { label: 'Low', color: 'bg-gray-500', textColor: 'text-gray-700', bgLight: 'bg-gray-100' },
}

export const CATEGORY_CONFIG = {
  hardware: { label: 'Hardware', icon: 'Monitor' },
  software: { label: 'Software', icon: 'Code' },
  network: { label: 'Network', icon: 'Wifi' },
  access: { label: 'Access', icon: 'Key' },
}
