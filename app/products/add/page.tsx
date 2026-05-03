"use client"

import React from 'react'
import RootLayout from '../../RootLayout'
import ProductForm from '@/components/products/ProductForm'
import { useRouter } from 'next/navigation'

const AddProductPage = () => {
  const router = useRouter()

  const handleSuccess = () => {
    router.push("/products")
  }

  const handleCancel = () => {
    router.push('/products')
  }

  return (
    <RootLayout>
      <div className="space-y-4 text-[#333]">
        <div className="px-2 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-customButton-text">Add Product</h1>
              <p className="text-sm text-[#7A6C53] mt-1">Create a new product for your store</p>
            </div>
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-md border border-[#FFC0C0] text-[#A30000] hover:border-[#FF9999] hover:text-[#C70000] hover:bg-[#FFF5F5] transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Products
            </button>
          </div>
        </div>
        
        <ProductForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          mode="add"
        />
      </div>
    </RootLayout>
  )
}

export default AddProductPage
