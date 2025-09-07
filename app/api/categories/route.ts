import { NextResponse } from 'next/server';
import { getCategories, addCategory } from '@/lib/services/categoryService';

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const imageFile = formData.get('image') as File | null;

    if (!name || !imageFile) {
      return NextResponse.json(
        { error: 'Name and image are required' },
        { status: 400 }
      );
    }

    const categoryId = await addCategory({ name, imageUrl: '' }, imageFile);
    return NextResponse.json(
      { id: categoryId, message: 'Category added successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding category:', error);
    return NextResponse.json(
      { error: 'Failed to add category' },
      { status: 500 }
    );
  }
}
