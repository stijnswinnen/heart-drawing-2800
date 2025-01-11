import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { Image } from "https://deno.land/x/imagescript@1.2.15/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { imagePath } = await req.json()
    
    if (!imagePath) {
      console.error('No image path provided')
      throw new Error('No image path provided')
    }

    console.log('Processing image:', imagePath)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials')
      throw new Error('Server configuration error')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Download the original image
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('hearts')
      .download(imagePath)

    if (downloadError) {
      console.error('Download error:', downloadError)
      throw new Error(`Failed to download image: ${downloadError.message}`)
    }

    console.log('Image downloaded successfully')

    // Convert the file to a buffer
    const imageBuffer = await fileData.arrayBuffer()
    
    // Process the image with ImageScript
    let image
    try {
      image = await Image.decode(new Uint8Array(imageBuffer))
      console.log('Image decoded successfully')
    } catch (error) {
      console.error('Image decoding error:', error)
      throw new Error('Failed to decode image')
    }
    
    console.log('Image dimensions:', image.width, 'x', image.height)
    
    // Initialize bounds to the opposite extremes
    let minX = image.width
    let minY = image.height
    let maxX = 0
    let maxY = 0
    let hasContent = false
    
    // Safely scan the image for non-white content
    try {
      for (let y = 0; y < image.height; y++) {
        for (let x = 0; x < image.width; x++) {
          const pixel = image.getPixelAt(x + 1, y + 1) // ImageScript uses 1-based indexing
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
            hasContent = true
          }
        }
      }
    } catch (error) {
      console.error('Error processing pixels:', error)
      throw new Error('Failed to process image content')
    }
    
    if (!hasContent) {
      console.log('No content found in image, using full dimensions')
      minX = 0
      minY = 0
      maxX = image.width - 1
      maxY = image.height - 1
    }
    
    // Add padding
    const padding = 10
    minX = Math.max(0, minX - padding)
    minY = Math.max(0, minY - padding)
    maxX = Math.min(image.width - 1, maxX + padding)
    maxY = Math.min(image.height - 1, maxY + padding)
    
    console.log('Cropping bounds:', { minX, minY, maxX, maxY })
    
    // Ensure valid crop dimensions
    const cropWidth = Math.max(1, maxX - minX + 1)
    const cropHeight = Math.max(1, maxY - minY + 1)
    
    let croppedImage
    try {
      // Crop the image
      croppedImage = image.crop(minX + 1, minY + 1, cropWidth, cropHeight) // Adjust for 1-based indexing
      console.log('Image cropped successfully')
    } catch (error) {
      console.error('Cropping error:', error)
      throw new Error('Failed to crop image')
    }
    
    let processedBuffer
    try {
      // Convert to PNG buffer
      processedBuffer = await croppedImage.encode()
      console.log('Image encoded successfully')
    } catch (error) {
      console.error('Encoding error:', error)
      throw new Error('Failed to encode processed image')
    }

    // Get just the filename without any path
    const filename = imagePath.split('/').pop()
    if (!filename) {
      throw new Error('Invalid image path')
    }

    // Upload to optimized bucket (directly in root)
    const { error: uploadError } = await supabase
      .storage
      .from('optimized')
      .upload(filename, processedBuffer, {
        contentType: 'image/png',
        upsert: true
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw new Error(`Failed to upload optimized image: ${uploadError.message}`)
    }

    console.log('Optimized image uploaded successfully')

    return new Response(
      JSON.stringify({ 
        message: 'Image optimized successfully',
        optimizedPath: filename
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error processing image:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
        details: error.stack
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})