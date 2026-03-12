import React, { useState, useEffect } from "react";
import {
  Truck,
  Package,
  CheckCircle,
  RefreshCw,
  MapPin,
  Phone,
  Navigation,
  LayoutDashboard,
  History,
  User,
  Search,
  Bell,
  Wifi,
  Battery,
  Signal,
  Clock,
  Loader2,
} from "lucide-react";

function App() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("todo"); // "todo" | "history"
  const [currentTime, setCurrentTime] = useState(new Date());
  const [shipperId, setShipperId] = useState("");

  // Đồng hồ thời gian thực
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load shipperId từ localStorage khi mount
  useEffect(() => {
    const savedId = localStorage.getItem("shipperId");
    if (savedId) {
      setShipperId(savedId);
    }
  }, []);

  // Fetch orders khi thay đổi tab hoặc shipperId
  useEffect(() => {
    if (shipperId) {
      fetchOrders();
    }
  }, [activeTab, shipperId]);

  const fetchOrders = async () => {
    if (!shipperId.trim()) {
      alert("Vui lòng nhập Shipper ID!");
      return;
    }

    setLoading(true);
    try {
      let query = `shipper_id=${shipperId}`;
      
      if (activeTab === "history") {
        query += `&status=DELIVERED&status=FAILED`;
      }

      const res = await fetch(
        `http://localhost:5002/api/orders/all?${query}`
      );
      const data = await res.json();

      if (data.success) {
        if (activeTab === "todo") {
          const filtered = data.orders.filter(
            (o) =>
              ["ASSIGNED", "READY_TO_PICK", "PICKING", "STORING", "DELIVERING"].includes(
                o.status
              ) && o.ghnOrderCode
          );
          setOrders(filtered);
        } else {
          // history tab - show delivered and failed orders
          setOrders(data.orders);
        }
      } else {
        console.error("API Error:", data.message);
        alert(data.message || "Không tải được đơn hàng");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Lỗi kết nối server!");
    } finally {
      setLoading(false);
    }
  };

  const handleShipperIdChange = (e) => {
    const newId = e.target.value.trim();
    setShipperId(newId);
    localStorage.setItem("shipperId", newId);
  };

  const handleAccept = async (orderId) => {
    if (loading) return;
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5002/api/orders/shipper-accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();

      if (data.success) {
        alert("Đã chấp nhận đơn hàng!");
        fetchOrders();
      } else {
        alert(data.message || "Không thể chấp nhận đơn!");
      }
    } catch (err) {
      alert("Lỗi server!");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (orderId) => {
    if (loading || !confirm("Bạn có chắc muốn từ chối đơn hàng này?")) return;
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5002/api/orders/shipper-reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();

      if (data.success) {
        alert("Đã từ chối đơn hàng!");
        fetchOrders();
      } else {
        alert(data.message || "Không thể từ chối!");
      }
    } catch (err) {
      alert("Lỗi server!");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (orderId) => {
    if (loading) return;
    try {
      setLoading(true);

      const currentOrder = orders.find((o) => o._id === orderId);
      let updateData = { orderId };

      let nextStatus;
      switch (currentOrder?.status) {
        case "READY_TO_PICK":
          nextStatus = "PICKING";
          break;
        case "PICKING":
          nextStatus = "STORING";
          break;
        case "STORING":
          nextStatus = "DELIVERING";
          break;
        case "DELIVERING":
          nextStatus = "DELIVERED";
          updateData.cod_amount = currentOrder.totalPrice;
          updateData.delivery_note = "Giao hàng thành công";
          break;
        default:
          alert("Trạng thái không hợp lệ!");
          return;
      }

      updateData.status = nextStatus;

      const res = await fetch("http://localhost:5002/api/orders/shipper-update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      const data = await res.json();

      if (data.success) {
        alert("Cập nhật hành trình thành công!");
        fetchOrders();
      } else {
        alert(data.message || "Không thể cập nhật trạng thái!");
      }
    } catch (err) {
      alert("Lỗi server!");
    } finally {
      setLoading(false);
    }
  };

  const getButtonTextAndColor = (status) => {
    switch (status) {
      case "READY_TO_PICK":
        return { text: "Xác nhận lấy hàng", color: "bg-blue-600" };
      case "PICKING":
        return { text: "Nhập kho Mega SOC", color: "bg-orange-500" };
      case "STORING":
        return { text: "Xuất kho đi giao", color: "bg-purple-600" };
      case "DELIVERING":
        return { text: "Giao thành công", color: "bg-green-600" };
      default:
        return { text: "Cập nhật", color: "bg-gray-500" };
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4 py-10 font-sans">
      <div className="relative mx-auto border-[8px] border-[#333] rounded-[60px] h-[850px] w-[395px] bg-black shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden ring-[4px] ring-[#1a1a1a]">
        {/* Status bar giả lập điện thoại */}
        <div className="absolute top-0 w-full h-12 flex justify-between items-center px-8 z-[100] text-white text-sm font-bold">
          <span>{currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          <div className="absolute left-1/2 -translate-x-1/2 top-3 w-[120px] h-[35px] bg-black rounded-full border border-white/5" />
          <div className="flex items-center gap-1.5">
            <Signal size={14} /> <Wifi size={14} /> <Battery size={18} />
          </div>
        </div>

        {/* Nội dung app */}
        <div className="h-full w-full bg-[#f4f4f4] overflow-y-auto scrollbar-hide pt-12">
          {/* Input Shipper ID */}
          <div className="bg-white mx-4 mt-4 p-4 rounded-lg shadow-sm border">
            <label className="block text-sm font-medium text-gray-700 mb-2">Shipper ID:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shipperId}
                onChange={handleShipperIdChange}
                placeholder="Nhập Shipper ID của bạn"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#f26522]"
              />
              <button
                onClick={fetchOrders}
                disabled={loading || !shipperId.trim()}
                className="px-4 py-2 bg-[#f26522] text-white rounded-md text-sm font-medium hover:bg-[#e55a1f] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                {loading ? "Đang tải..." : "Tải đơn"}
              </button>
            </div>
          </div>

          {/* Header */}
          <header className="bg-gradient-to-r from-[#f26522] to-[#9d0b0f] text-white p-5 pt-8 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/20">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-[10px] opacity-70 font-black uppercase">Bưu tá Hồng Lam</p>
                  <h2 className="text-sm font-black">Phan Đức Nhân</h2>
                </div>
              </div>
              <button onClick={fetchOrders} disabled={loading} className={loading ? "animate-spin" : ""}>
                <RefreshCw size={22} />
              </button>
            </div>
          </header>

          {/* Tabs */}
          <div className="flex p-4 gap-2">
            <button
              onClick={() => setActiveTab("todo")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "todo" ? "bg-[#f26522] text-white shadow-md" : "bg-white text-gray-400"
              }`}
            >
              Đang giao ({activeTab === "todo" ? orders.length : "..."}) 
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "history" ? "bg-[#f26522] text-white shadow-md" : "bg-white text-gray-400"
              }`}
            >
              Lịch sử đơn
            </button>
          </div>

          {/* Danh sách đơn hàng */}
          <div className="px-4 pb-28 space-y-4">
            {loading && orders.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[32px] border border-dashed text-gray-400">
                <Loader2 size={48} className="mx-auto mb-2 animate-spin opacity-50" />
                <p className="text-xs">Đang tải đơn hàng...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[32px] border border-dashed text-gray-400">
                <Package size={48} className="mx-auto mb-2 opacity-20" />
                <p className="text-xs">Không có đơn hàng nào!</p>
              </div>
            ) : (
              orders.map((order) => {
                const { text, color } = getButtonTextAndColor(order.status);

                return (
                  <div
                    key={order._id}
                    className="bg-white rounded-[28px] shadow-sm border border-gray-100 overflow-hidden"
                  >
                    <div className="flex justify-between items-center px-5 py-3 bg-gray-50/50 border-b">
                      <span className="text-[10px] font-black text-[#f26522] uppercase">
                        {order.ghnOrderCode || "Không có mã GHN"}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div className="p-5 space-y-4">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-orange-50 rounded-full flex items-center justify-center text-[#f26522]">
                          <User size={16} />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-gray-800">
                            {order.customerInfo?.fullName || "Khách hàng"}
                          </h4>
                          <p className="text-xs text-blue-500 font-bold">
                            {order.customerInfo?.phone || "-"}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3 text-xs text-gray-500 font-medium">
                        <MapPin size={16} className="text-red-500 shrink-0" />
                        <p>{order.customerInfo?.address || "Chưa có địa chỉ"}</p>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-dashed">
                        <div>
                          <p className="text-[9px] text-gray-400 font-bold uppercase">Thu hộ COD</p>
                          <p className="font-black text-lg text-red-600">
                            {order.cod_amount
                              ? order.cod_amount.toLocaleString("vi-VN")
                              : order.totalPrice?.toLocaleString("vi-VN") || "0"}{" "}
                            đ
                          </p>
                          {order.assigned_at && (
                            <p className="text-[8px] text-gray-500 mt-1">
                              Gán: {new Date(order.assigned_at).toLocaleString("vi-VN")}
                            </p>
                          )}
                        </div>

                        {activeTab === "todo" && (
                          <div className="flex flex-col gap-2 items-end">
                            {order.status === "ASSIGNED" ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleAccept(order._id)}
                                  disabled={loading}
                                  className="px-3 py-2 rounded-xl font-bold text-[10px] uppercase bg-green-600 text-white shadow-lg active:scale-90 disabled:opacity-50"
                                >
                                  Chấp nhận
                                </button>
                                <button
                                  onClick={() => handleReject(order._id)}
                                  disabled={loading}
                                  className="px-3 py-2 rounded-xl font-bold text-[10px] uppercase bg-red-600 text-white shadow-lg active:scale-90 disabled:opacity-50"
                                >
                                  Từ chối
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleUpdate(order._id)}
                                disabled={loading}
                                className={`w-44 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-90 flex items-center justify-center gap-2 shadow-lg text-white disabled:opacity-50 ${color}`}
                              >
                                {text}
                                <Navigation size={14} fill="white" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom navigation dock */}
          <nav className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] bg-white/90 backdrop-blur-xl rounded-[30px] flex justify-around p-3 shadow-2xl border border-white/20">
            <button
              onClick={() => setActiveTab("todo")}
              className={`p-3 rounded-2xl ${activeTab === "todo" ? "bg-[#f26522] text-white" : "text-gray-400"}`}
            >
              <LayoutDashboard size={22} />
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`p-3 rounded-2xl ${activeTab === "history" ? "bg-[#f26522] text-white" : "text-gray-400"}`}
            >
              <History size={22} />
            </button>
          </nav>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-black/20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default App;