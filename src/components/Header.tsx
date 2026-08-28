import React, { useState } from "react";
import { BookOpen, Info, X, ShieldAlert } from "lucide-react";

export const Header: React.FC = () => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <header className="bg-[var(--primary)] text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Brand / Emblem */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/10 text-white flex items-center justify-center border border-white/20 flex-shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight font-serif text-white">
              Tra cứu Sử liệu Việt Nam
            </h1>
          </div>
        </div>

        {/* Actions & Info */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInfo(true)}
            id="btn-app-info"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/90 bg-white/10 hover:bg-[#7f0716] hover:text-white active:bg-[#5f0510] border border-white/20 transition-colors cursor-pointer"
            title="Nguyên tắc nghiên cứu sử liệu"
          >
            <Info className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nguyên tắc sử liệu</span>
          </button>
        </div>
      </div>

      {/* Info Modal / Dialog */}
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 text-[var(--card-foreground)] border border-[#e5e5e5] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2 text-[var(--primary)]">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="font-serif font-bold text-lg text-gray-900">
                  Nguyên tắc tiếp cận sử liệu
                </h3>
              </div>
              <button
                onClick={() => setShowInfo(false)}
                className="p-1 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-sm text-gray-700 leading-relaxed">
              <div className="p-3 bg-red-50/70 rounded-lg border border-red-100">
                <p className="font-semibold text-xs uppercase tracking-wider mb-1 text-[var(--primary)]">
                  Không phải công cụ kiểm tra đúng/sai (Fact-checking)
                </p>
                <p className="text-xs text-gray-600 leading-normal">
                  Hệ thống không phân định phát biểu là “Đúng”, “Sai”, “Đã xác minh” hay “Bị bác bỏ”.
                </p>
              </div>

              <p className="text-xs sm:text-sm text-gray-700">
                Mục đích cốt lõi là <strong>rút ngắn khoảng cách giữa người đọc và văn bản sử liệu gốc</strong>:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-600">
                <li>
                  Tách các phát biểu lịch sử có ngữ cảnh từ văn bản bạn nhập vào.
                </li>
                <li>
                  Truy vấn các đoạn văn bản tương ứng từ các bộ chính sử (như <em>Đại Việt Sử Ký Toàn Thư, Khâm Định Việt Sử Thông Giám Cương Mục, Vương Triều Trần...</em>).
                </li>
                <li>
                  Trình bày nguyên văn trích đoạn, số trang, đề mục và chú thích để bạn <strong>tự đọc, đối chiếu và tự đưa ra nhận định học thuật</strong>.
                </li>
              </ul>

              <p className="text-xs text-gray-500 italic border-t border-gray-100 pt-2.5">
                * Nếu một phát biểu chưa tìm thấy đoạn sử liệu trong kho hiện tại, điều đó chỉ có nghĩa kho dữ liệu số chưa bao quát đến trích đoạn đó, không đồng nghĩa phát biểu là sai.
              </p>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowInfo(false)}
                className="px-4 py-2 bg-[var(--primary)] hover:bg-[#7f0716] active:bg-[#5f0510] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Đã hiểu & Tiếp tục
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
