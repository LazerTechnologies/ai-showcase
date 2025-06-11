export interface MessageColors {
  avatarColor: string;
  streamColor: string;
}

export const USER_MESSAGE_COLORS: MessageColors = {
  avatarColor: "bg-primary text-primary-foreground",
  streamColor: "bg-primary text-primary-foreground",
};

export const MESSAGE_COLOR_SETS: MessageColors[] = [
  {
    avatarColor: "bg-blue-500 text-white",
    streamColor:
      "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100",
  },
  {
    avatarColor: "bg-green-500 text-white",
    streamColor:
      "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100",
  },
  {
    avatarColor: "bg-purple-500 text-white",
    streamColor:
      "bg-purple-100 text-purple-900 dark:bg-purple-900 dark:text-purple-100",
  },
  {
    avatarColor: "bg-orange-500 text-white",
    streamColor:
      "bg-orange-100 text-orange-900 dark:bg-orange-900 dark:text-orange-100",
  },
  {
    avatarColor: "bg-red-500 text-white",
    streamColor: "bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100",
  },
  {
    avatarColor: "bg-yellow-500 text-white",
    streamColor:
      "bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100",
  },
];
