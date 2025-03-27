
// Define a type that includes the timestamp properties we want to modify
export type WithTimestamps = {
  created_at?: string;
  updated_at?: string;
  [key: string]: any;  // Allow other properties
};

export const handleTimestamps = <T extends WithTimestamps>(item: T): T => {
  const now = new Date().toISOString();
  
  // Make sure timestamps are in ISO format for compatibility
  if (!item.created_at) {
    item.created_at = now;
  }
  
  item.updated_at = now;
  
  return item;
};

// Function to convert Supabase results to the expected format
export const mapResultData = <T>(data: T[] | null | undefined): T[] => {
  if (!data) return []; // Return empty array if data is null or undefined
  
  return data.map(item => {
    // Convert timestamps to ISO string if they are in Date format
    if (item) {
      if ((item as any).created_at instanceof Date) {
        (item as any).created_at = (item as any).created_at.toISOString();
      }
      if ((item as any).updated_at instanceof Date) {
        (item as any).updated_at = (item as any).updated_at.toISOString();
      }
    }
    return item;
  });
};
