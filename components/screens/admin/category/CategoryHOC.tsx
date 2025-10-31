import dynamic from 'next/dynamic'
import React from 'react'
import AddCategory from './AddCategory';


const CategoryPage= dynamic(() => import("./Category"), {
    ssr: true,
    loading: () => <p>Loading...</p>,
});
const CategoryHOC = () => {
  return (

    
    <CategoryPage/>

  )
}

export default CategoryHOC
