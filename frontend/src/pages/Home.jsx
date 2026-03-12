import Slider from "../components/Home/Slider"
import ProductSection from "../components/Home/ProductSection.jsx"
import Feedback from "../components/Home/Feedback.jsx"
import Policy from "../components/Policy.jsx"
function Home() {
  return (
    <>
    <Slider />
    {/* 1. Đặc Sản Nổi Bật (Mặc định type='hot') */}
      <ProductSection title="ĐẶC SẢN NỔI BẬT" type="hot" />
      
      {/* 2. Đặc Sản Theo Mùa (Có thêm Tab chuyển mùa) */}
      <ProductSection title="ĐẶC SẢN THEO MÙA" type="seasonal" />

      {/* 3. Đánh Giá Khách Hàng */}
      <Feedback />

      {/* 4. Chính Sách */}
      <Policy/>
    </>
  )
}

export default Home