import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Explore from './pages/Explore'
import CategoryGrid from './pages/CategoryGrid'
import CategoryDetail from './pages/CategoryDetail'
import TrendDetail from './pages/TrendDetail'
import MyTrends from './pages/MyTrends'
import Search from './pages/Search'
import Radar from './pages/Radar'
import Onboarding from './pages/Onboarding'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/category" element={<CategoryGrid />} />
        <Route path="/category/:key" element={<CategoryDetail />} />
        <Route path="/trend/:id" element={<TrendDetail />} />
        <Route path="/my" element={<MyTrends />} />
        <Route path="/search" element={<Search />} />
        <Route path="/radar" element={<Radar />} />
        <Route path="/onboarding" element={<Onboarding />} />
      </Routes>
    </BrowserRouter>
  )
}
