import { NextResponse } from 'next/server';
import { getCategories, updateCategory, deleteCategory } from '@/lib/services/categoryService';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const categories = await getCategories();
    const category = categories.find((cat) => cat.id === params.id);
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string | null;
    const imageFile = formData.get('image') as File | null;
    const oldImageUrl = formData.get('oldImageUrl') as string | null;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    await updateCategory(
      params.id,
      { name },
      imageFile || undefined,
      oldImageUrl || undefined
    );

    return NextResponse.json(
      { message: 'Category updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('imageUrl');
    
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required for deletion' },
        { status: 400 }
      );
    }

    await deleteCategory(params.id, imageUrl);
    
    return NextResponse.json(
      { message: 'Category deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
