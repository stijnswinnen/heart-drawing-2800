import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { Image } from "https://deno.land/x/imagescript@1.2.15/mod.ts"

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

    console.log('Processing image:', imagePath)

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

    console.log('Image downloaded successfully')

    // Convert the file to a buffer
    const imageBuffer = await fileData.arrayBuffer()
    
    // Process the image with ImageScript
    const image = await Image.decode(new Uint8Array(imageBuffer))
    
    // Find the bounds of the non-white content
    let minX = image.width, minY = image.height, maxX = 0, maxY = 0
    
    for (let y = 0; y < image.height; y++) {
      for (let x = 0; x < image.width; x++) {
        const pixel = image.getPixelAt(x, y)
        const r = (pixel >> 24) & 255
        const g = (pixel >> 16) & 255
        const b = (pixel >> 8) & 255
        const a = pixel & 255
        
        // Check if pixel is not white (allowing some tolerance)
        if (a > 0 && (r < 250 || g < 250 || b < 250)) {
          minX = Math.min(minX, x)
          minY = Math.min(minY, y)
          maxX = Math.max(maxX, x)
          maxY = Math.max(maxY, y)
        }
      }
    }
    
    // Add some padding
    const padding = 10
    minX = Math.max(0, minX - padding)
    minY = Math.max(0, minY - padding)
    maxX = Math.min(image.width - 1, maxX + padding)
    maxY = Math.min(image.height - 1, maxY + padding)
    
    // Crop the image
    const croppedImage = image.crop(minX, minY, maxX - minX + 1, maxY - minY + 1)
    
    // Convert to PNG buffer
    const processedBuffer = await croppedImage.encode()

    console.log('Image processed successfully')

    // Upload to optimized bucket
    const optimizedPath = `optimized/${imagePath.split('/').pop()}`
    const { error: uploadError } = await supabase
      .storage
      .from('optimized')
      .upload(optimizedPath, processedBuffer, {
        contentType: 'image/png',
        upsert: true
      })

    if (uploadError) {
      throw new Error(`Failed to upload optimized image: ${uploadError.message}`)
    }

    console.log('Optimized image uploaded successfully')

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
    console.error('Error processing image:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})