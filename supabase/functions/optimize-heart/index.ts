import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import Sharp from 'https://esm.sh/sharp@0.32.6'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { imagePath } = await req.json()
    
    if (!imagePath) {
      throw new Error('No image path provided')
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Download the original image
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('hearts')
      .download(imagePath)

    if (downloadError) {
      throw new Error(`Failed to download image: ${downloadError.message}`)
    }

    // Convert the file to a buffer
    const imageBuffer = await fileData.arrayBuffer()

    // Process the image with Sharp
    const image = Sharp(imageBuffer)
    const { data: metadata } = await image.metadata()

    // Trim the white space
    const processed = await image
      .trim({ threshold: 250 }) // High threshold to only remove white/very light pixels
      .toBuffer()

    // Upload to optimized bucket
    const optimizedPath = `optimized/${imagePath.split('/').pop()}`
    const { error: uploadError } = await supabase
      .storage
      .from('optimized')
      .upload(optimizedPath, processed, {
        contentType: 'image/png',
        upsert: true
      })

    if (uploadError) {
      throw new Error(`Failed to upload optimized image: ${uploadError.message}`)
    }

    return new Response(
      JSON.stringify({ 
        message: 'Image optimized successfully',
        optimizedPath 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})