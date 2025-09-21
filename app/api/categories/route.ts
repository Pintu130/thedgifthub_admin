import { NextResponse } from 'next/server';
import { getCategories, addCategory, getCategoriesByCategory, getAllCategories, getCategoriesByStatus } from '@/lib/services/categoryService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryFilter = searchParams.get('category');
    const statusFilter = searchParams.get('status');

    console.log('API - Category filter:', categoryFilter);
    console.log('API - Status filter:', statusFilter);

    let categories;
    
    if (categoryFilter && categoryFilter !== '') {
      // If specific category is requested by ID, get that category
      console.log('Fetching specific category by ID');
      categories = await getCategoriesByCategory(categoryFilter);
    } else if (statusFilter && statusFilter !== '') {
      // If status filter is provided, use dedicated status function
      console.log('Fetching categories by status:', statusFilter);
      
      // Validate status value
      if (!['active', 'inactive'].includes(statusFilter)) {
        return NextResponse.json(
          { error: 'Invalid status value. Must be either "active" or "inactive"' },
          { status: 400 }
        );
      }
      
      categories = await getCategoriesByStatus(statusFilter);
    } else {
      // Get all categories without any filter
      console.log('Fetching all categories');
      categories = await getAllCategories();
    }
    
    console.log('API - Returning categories:', categories.length, 'items');
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const status = (formData.get('status') as string) || 'active';
    const imageFile = formData.get('image') as File | null;

    console.log('POST - Creating category:', { name, status });

    if (!name || !imageFile) {
      return NextResponse.json(
        { error: 'Name and image are required' },
        { status: 400 }
      );
    }

    if (!['active', 'inactive'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be either active or inactive' },
        { status: 400 }
      );
    }

    const categoryId = await addCategory({ 
      name, 
      imageUrl: '', 
      status: status as 'active' | 'inactive' 
    }, imageFile);
    
    return NextResponse.json(
      { id: categoryId, message: 'Category added successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding category:', error);
    return NextResponse.json(
      { error: 'Failed to add category', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}