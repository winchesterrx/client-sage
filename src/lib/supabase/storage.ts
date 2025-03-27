
import { supabase } from './client';

// Function to upload files to Supabase storage
export const uploadFile = async (
  file: File,
  bucketName: string,
  path: string
): Promise<string> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      throw error;
    }
    
    // Return the file path in Supabase
    return data.path;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Function to get public URL of a file
export const getPublicUrl = (bucketName: string, path: string): string => {
  const { data } = supabase.storage.from(bucketName).getPublicUrl(path);
  return data.publicUrl;
};
