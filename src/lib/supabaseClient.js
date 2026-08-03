import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xyzcompany.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhY2NvdW50X2tleSI6ImFub25fa2V5In0=';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = () => {
  return (
    import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_ANON_KEY &&
    !import.meta.env.VITE_SUPABASE_URL.includes('xyzcompany')
  );
};

// Storage helper for upload to "receipts" bucket
export const uploadReceiptToSupabase = async (file) => {
  try {
    if (!isSupabaseConfigured()) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `receipts/${fileName}`;

    const { data, error } = await supabase.storage
      .from('receipts')
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (error) {
      console.error('Supabase receipt upload error:', error);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from('receipts')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('Storage error:', err);
    return null;
  }
};
