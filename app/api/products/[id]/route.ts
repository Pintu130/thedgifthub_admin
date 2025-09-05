import { NextResponse } from 'next/server';
import { getProductById, updateProduct, deleteProduct } from '@/lib/services/productService';

// GET /api/products/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const product = await getProductById(params.id);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PATCH /api/products/[id]
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData();
    
    // Extract text fields
    const productData: any = {
      productName: formData.get('productName') as string,
      productPrice: parseFloat(formData.get('productPrice') as string) || 0,
      originalPrice: parseFloat(formData.get('originalPrice') as string) || 0,
      discountPercentage: parseFloat(formData.get('discountPercentage') as string) || 0,
      availableOffers: formData.get('availableOffers') as string || '',
      highlights: formData.get('highlights') as string || '',
      activity: 1,
    };

    // Handle existing images
    const existingImages = formData.getAll('images') as string[];
    if (existingImages && existingImages.length > 0) {
      productData.images = existingImages;
    }

    // Handle new image uploads
    const imageFiles = formData.getAll('images') as File[];
    if (imageFiles && imageFiles.length > 0) {
      productData.images = [...(productData.images || []), ...imageFiles];
    }

    await updateProduct(params.id, productData);
    
    return NextResponse.json({ 
      success: true,
      message: 'Product updated successfully' 
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update product',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const product = await getProductById(params.id);
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    await deleteProduct(params.id);
    
    return NextResponse.json({ 
      success: true,
      message: 'Product deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete product',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
