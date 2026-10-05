import { createClient } from '@supabase/supabase-js';

export const PRODUCT_IMAGES_BUCKET = 'product-images';

// Valeurs de repli pour ne pas casser le build/import quand Supabase n'est pas encore
// configuré ; seules de vraies valeurs permettent d'appeler l'API Storage (voir lib/stripe.ts
// et lib/resend.ts pour le même pattern).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_build_only';

// Client "service role" : bypass les policies RLS, à n'utiliser que côté serveur (Server
// Actions déjà protégées par requireAdmin()), jamais exposé au client.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
});

export interface UploadProductImageResult {
  url: string;
  path: string;
}

export async function uploadProductImage(
  productId: string,
  file: File
): Promise<UploadProductImageResult> {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${productId}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabaseAdmin.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) {
    throw new Error(`Échec de l'upload de l'image : ${error.message}`);
  }

  const { data } = supabaseAdmin.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);

  return { url: data.publicUrl, path };
}

export async function deleteProductImage(path: string): Promise<void> {
  const { error } = await supabaseAdmin.storage.from(PRODUCT_IMAGES_BUCKET).remove([path]);
  if (error) {
    throw new Error(`Échec de la suppression de l'image : ${error.message}`);
  }
}
