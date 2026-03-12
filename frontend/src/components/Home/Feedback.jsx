import { FaQuoteLeft, FaStar } from "react-icons/fa";
import '../../styles/feedback.css';

const Reviews = [
  {
    id: 1,
    name: "Chị Minh Thư",
    role: "Nhân viên văn phòng - TP.HCM",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1888&auto=format&fit=crop",
    comment: "Mình rất thích vị Khô Cá Dứa ở đây, chuẩn vị Cần Giờ, thịt dày và không bị mặn quá. Đóng gói hút chân không rất kỹ, mang đi biếu sếp rất sang trọng.",
    rating: 5,
    date: "12/01/2026"
  },
  {
    id: 2,
    name: "Anh Hoàng Nam",
    role: "Kinh doanh tự do - Hà Nội",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1887&auto=format&fit=crop",
    comment: "Lần đầu mua online mà ưng ý vậy. Trà Shan Tuyết thơm lừng, uống vào vị ngọt hậu rất sâu. Shop tư vấn nhiệt tình, giao hàng ra Hà Nội chỉ mất 2 ngày.",
    rating: 5,
    date: "05/01/2026"
  },
  {
    id: 3,
    name: "Cô Thanh Mai",
    role: "Nội trợ - Đà Nẵng",
    avatar: "https://images.unsplash.com/photo-1554151228-14d9def656ec?q=80&w=1786&auto=format&fit=crop",
    comment: "Tôm khô Cà Mau rất ngon, nấu canh bầu ngọt nước vô cùng. Sẽ ủng hộ shop dài dài vì tìm được chỗ bán đồ sạch, an tâm cho cả nhà ăn.",
    rating: 4,
    date: "18/01/2026"
  },
    {
    id: 4,
    name: "Cô Thanh Mai",
    role: "Nội trợ - Đà Nẵng",
    avatar: "https://images.unsplash.com/photo-1554151228-14d9def656ec?q=80&w=1786&auto=format&fit=crop",
    comment: "Tôm khô Cà Mau rất ngon, nấu canh bầu ngọt nước vô cùng. Sẽ ủng hộ shop dài dài vì tìm được chỗ bán đồ sạch, an tâm cho cả nhà ăn.",
    rating: 3,
    date: "18/01/2026"
  },{
    id: 5,
    name: "Chú Ba",
    role: "Cần Thơ",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80",
    comment: "Hàng ngon, nhưng giao hàng hơi chậm xíu do mưa bão.",
    rating: 5, 
    date: "2026-01-10"
  },
  {
    id: 6,
    name: "Bạn Ngọc",
    role: "Sinh viên",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80",
    comment: "Mua làm quà tết cho ba mẹ rất hợp lý.",
    rating: 5,
    date: "2026-01-19" // Mới nhất
  }
];

// Component hiển thị số sao
const StarRating = ({ count }) => {
  return (
    <div className="star-rating">
      {[...Array(5)].map((_, index) => (
        <FaStar key={index} className={index < count ? "star active" : "star"} />
      ))}
    </div>
  );
};

// xử lý hiện thị đánh giá ưu tiên 3 đánh giá cao nhất và  mới nhất
const sortedReviews = [...Reviews].sort((a, b) => {
     // Nếu rating bằng nhau thì so sánh ngày (mới nhất lên trên)
     if (b.rating === a.rating) {
         return new Date(b.date) - new Date(a.date);
     }
     // Ưu tiên rating cao hơn
     return b.rating - a.rating;
  });
  // Cắt lấy đúng 3 cái đầu tiên
  const top3Reviews = sortedReviews.slice(0, 3);
const Feedback = () => {
  return (
    <section className="feedback-section">
      <div className="container">
        
        {/* Header Title */}
        <div className="section-header-wrapper center">
          <h2 className="section-title">KHÁCH HÀNG NÓI VỀ CHÚNG TÔI</h2>
        </div>
        <p className="section-subtitle">Hơn 10.000+ khách hàng đã tin dùng đặc sản 3 miền</p>

        {/* Grid Feedback */}
        <div className="feedback-grid">
          {top3Reviews.map((item) => (
            <div className="feedback-card" key={item.id}>
              {/* Icon trích dẫn làm nền mờ */}
              <FaQuoteLeft className="quote-icon-bg" />
              
              <div className="card-top">
                <img src={item.avatar} alt={item.name} className="user-avatar" />
                <div className="user-info">
                  <h4 className="user-name">{item.name}</h4>
                  <span className="user-role">{item.role}</span>
                  <StarRating count={item.rating} />
                </div>
              </div>

              <div className="card-body">
                <p className="user-comment">"{item.comment}"</p>
              </div>

              <div className="card-footer">
                <span className="review-date">Ngày đăng: {item.date}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Feedback;