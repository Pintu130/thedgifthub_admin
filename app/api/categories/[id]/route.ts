import { NextResponse } from 'next/server';
import { updateCategory, deleteCategory } from '@/lib/services/categoryService';

// PUT /api/categories/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const status = (formData.get('status') as string) || 'active';
    const imageFile = formData.get('image') as File | null;

    console.log('PUT - Updating category:', { id, name, status });

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!['active', 'inactive'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be either active or inactive' },
        { status: 400 }
      );
    }

    // Get old image URL from query params if provided (for cleanup)
    const { searchParams } = new URL(request.url);
    const oldImageUrl = searchParams.get('oldImageUrl') || undefined;

    await updateCategory(
      id, 
      { 
        name, 
        status: status as 'active' | 'inactive' 
      }, 
      imageFile || undefined, 
      oldImageUrl
    );

    return NextResponse.json({
      message: 'Category updated successfully'
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('imageUrl');

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    await deleteCategory(id, imageUrl);

    return NextResponse.json({
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}