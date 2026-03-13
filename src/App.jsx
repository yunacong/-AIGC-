import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import ProductUnderstanding from './pages/ProductUnderstanding'
import ContentGeneration from './pages/ContentGeneration'
import ImageOptimization from './pages/ImageOptimization'
import ContentDiagnosis from './pages/ContentDiagnosis'
import VideoGeneration from './pages/VideoGeneration'
import ReviewOptimization from './pages/ReviewOptimization'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product" element={<ProductUnderstanding />} />
        <Route path="/content" element={<ContentGeneration />} />
        <Route path="/image" element={<ImageOptimization />} />
        <Route path="/diagnose" element={<ContentDiagnosis />} />
        <Route path="/video" element={<VideoGeneration />} />
        <Route path="/review" element={<ReviewOptimization />} />
      </Routes>
    </BrowserRouter>
  )
}
