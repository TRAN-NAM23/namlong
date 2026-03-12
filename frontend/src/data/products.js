export const Products = [
  {
    id: 1,
    name: "Cá Dứa 1 Nắng Cần Giờ (Loại 1)",
    price: 419000,
    oldPrice: 480000,
    image: "https://motortrip.vn/wp-content/uploads/2021/12/ca-dua-1-nang-26.jpg",
    // Mảng ảnh con (Gallery)
    images:[
      "https://motortrip.vn/wp-content/uploads/2021/12/ca-dua-1-nang-26.jpg",
      "https://motortrip.vn/wp-content/uploads/2021/12/ca-dua-1-nang-26.jpg", 
      "https://motortrip.vn/wp-content/uploads/2021/12/ca-dua-1-nang-26.jpg",
      "https://onggiau.com.vn/wp-content/uploads/2024/07/1_ca-dua-1-nang-800.jpg",
    ],
    discount: 13,
    isHot: true,
    season: 'spring',
    category: 'kho',
    region: 'nam',
    rating: 5,       
    reviewCount: 45,  
    description: "Cá dứa Cần Giờ chính gốc, thịt dày, dẻo thơm, phơi đúng 1 nắng.",
    descriptionDetail: ""
  },
  {
    id: 2,
    name: "Thịt trâu gác bếp Tây Bắc",
    price: 309000,
    oldPrice: 340000,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80",
    discount: 9,
    isHot: true,
    season: 'winter',
    category: 'kho',
    region: 'bac',
    rating: 4.5,      
    reviewCount: 28,  
    description: "Đặc sản Tây Bắc, tẩm ướp mắc khén hạt dổi, hun khói bếp củi tự nhiên.",
    descriptionDetail: ""
  },
  {
    id: 3,
    name: "Khô Cá Tra Phồng Biển Hồ",
    price: 350000,
    oldPrice: null,
    image: "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?q=80",
    discount: 0,
    isHot: true,
    season: 'summer',
    category: 'kho',
    region: 'nam',
    rating: 4,        
    reviewCount: 12, 
    description: "Cá tra phồng Campuchia, chiên lên giòn rụm, vị vừa ăn.",
    descriptionDetail: ""
  },
  {
    id: 8,
    name: "Trà Shan Tuyết Cổ Thụ Hà Giang",
    price: 450000,
    oldPrice: null,
    image: "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?q=80",
    discount: 0,
    isHot: false,
    season: 'spring',
    category: 'tra',
    region: 'bac',
    rating: 5,        
    reviewCount: 8,   
    description: "Trà cổ thụ trăm năm tuổi, nước vàng óng, vị ngọt hậu sâu.",
    descriptionDetail: ""
  },
  {
    id: 9,
    name: "Mắm Tôm Chua Huế",
    price: 85000,
    oldPrice: null,
    image: "https://images.unsplash.com/photo-1629854743202-b43081e74f19?q=80",
    discount: 0,
    isHot: false,
    season: 'autumn',
    category: 'mam',
    region: 'trung',
    rating: 4.8,      // <--- Đã thêm
    reviewCount: 30,  // <--- Đã thêm
    description: "Đặc sản Cố Đô, tôm chua cay mặn ngọt hài hòa, ăn kèm thịt luộc.",
    descriptionDetail: ""
  },

  // --- HẠT DINH DƯỠNG ---
  {
    id: 10,
    name: "Hạt Điều Rang Củi Bình Phước (500g)",
    price: 165000,
    oldPrice: 180000,
    image: "https://cerafoods.com/wp-content/uploads/2023/09/hat-dieu-rang-muoi-binh-phuoc-500g-2.jpg",
    discount: 8,
    isHot: true,
    season: 'autumn',
    category: 'hat',
    rating: 5,
    region: 'nam',
    reviewCount: 150,
    description: "Hạt điều rang củi giữ nguyên lớp lụa, giòn béo tự nhiên.",
    descriptionDetail: "" 
  },

  // --- BÁNH KẸO & MỨT ---
  {
    id: 11,
    name: "Cốm Làng Vòng Hà Nội",
    price: 250000,
    oldPrice: null,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80",
    discount: 0,
    isHot: false,
    season: 'autumn',
    category: 'banh-mut',
    rating: 5,
    reviewCount: 99,
    region: 'bac',
    description: "Hạt cốm dẻo thơm mùi lúa mới, gói lá sen thơm ngát.",
    descriptionDetail: ""
  },
  
  {
    id: 12,
    name: "Hồng Treo Gió Đà Lạt",
    price: 320000,
    oldPrice: 350000,
    image: "https://images.unsplash.com/photo-1629854743202-b43081e74f19?q=80",
    discount: 10,
    isHot: true,
    season: 'autumn',
    category: 'banh-mut',
    rating: 4.5,
    reviewCount: 65,
    region: 'trung',
    description: "Hồng treo công nghệ Nhật Bản, bên ngoài khô dẻo, bên trong mật ngọt."
  },
  {
    id: 13,
    name: "Gạo ST25 Ông Cua (Túi 5kg)",
    price: 180000,
    oldPrice: 200000,
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80",
    discount: 10,
    isHot: true,
    season: null,
    category: 'gao',
    rating: 5,
    reviewCount: 200,
    region: 'nam',
    description: "Gạo ngon nhất thế giới, cơm dẻo, thơm mùi lá dứa."
  }
];

// --- CÁC HÀM GET DATA (GIỮ NGUYÊN) ---

export const getAllProducts = () => {
  return Products;
};

export const getHotProducts = () => {
  return Products.filter(product => product.isHot === true);
};

export const getProductsBySeason = (season) => {
  return Products.filter(product => product.season === season);
};

export const getProductsByCategory = (categorySlug) => {
  if (!categorySlug) return Products;
  return Products.filter(product => product.category === categorySlug);
};

export const getProductById = (id) => {
  return Products.find(product => product.id === parseInt(id));
};

export const getRelatedProducts = (currentId, categorySlug) => {
  return Products.filter(product => 
      product.category === categorySlug && 
      product.id !== parseInt(currentId)
  ).slice(0, 4);
};