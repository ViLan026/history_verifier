import React from "react";
import { AlertTriangle, RefreshCw, Edit3 } from "lucide-react";

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
  onEdit: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  onRetry,
  onEdit,
}) => {
  return (
    <div className="bg-[#FAF7F0] border border-[#E6D0C5] rounded-xl p-8 shadow-xs text-center flex flex-col items-center justify-center my-6 max-w-xl mx-auto">
      <div className="w-12 h-12 rounded-full bg-[#FCE8E6] text-[#8B261E] flex items-center justify-center mb-4 border border-[#E8BFB9]">
        <AlertTriangle className="w-6 h-6" />
      </div>

      <h3 className="font-serif font-bold text-base text-[#1F1B18] mb-1.5">
        Không thể hoàn tất tra cứu
      </h3>

      <p className="text-xs text-[#6B5E52] leading-relaxed max-w-md mb-6">
        {message || "Không thể kết nối tới dịch vụ tìm nguồn sử liệu. Vui lòng thử lại."}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#8B261E] hover:bg-[#721F18] shadow-xs transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Thử lại</span>
        </button>

        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-[#4A4036] bg-[#EFE9DB] hover:bg-[#E4DBC8] border border-[#D5C9B3] transition-colors cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Chỉnh sửa nội dung</span>
        </button>
      </div>
    </div>
  );
};
