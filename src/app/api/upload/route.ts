import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cloudinaryConfig, generateUploadSignature } from '@/lib/cloudinary'

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get request body
    const body = await request.json()
    const { folder = 'pins' } = body

    // Generate timestamp
    const timestamp = Math.round(Date.now() / 1000)

    // Parameters to sign
    const paramsToSign = {
      timestamp,
      folder,
      // Optional: add upload preset if you've created one in Cloudinary
      // upload_preset: 'pinstar-pins',
    }

    // Generate signature
    const signature = await generateUploadSignature(paramsToSign)

    // Return signature and other required params
    return NextResponse.json({
      signature,
      timestamp,
      apiKey: cloudinaryConfig.apiKey,
      cloudName: cloudinaryConfig.cloudName,
      folder,
    })
  } catch (error) {
    console.error('Upload signature error:', error)
    return NextResponse.json(
      { error: 'Failed to generate upload signature' },
      { status: 500 }
    )
  }
}
