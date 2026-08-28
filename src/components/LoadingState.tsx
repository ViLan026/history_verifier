import React, { useState, useEffect } from "react";
import { BookOpen, Sparkles, Compass, Search } from "lucide-react";

export const LoadingState: React.FC = () => {
  const stages = [
    { text: "Đang phân tích nội dung văn bản...", detail: "Xác định các thực thể và mốc thời gian lịch sử" },
    { text: "Đang trích xuất các phát biểu lịch sử bảo toàn ngữ cảnh...", detail: "Tách các sự kiện và liên kết lịch sử" },
    { text: "Đang tìm các đoạn sử liệu liên quan trong kho thư tịch...", detail: "Truy vấn Đại Việt Sử Ký Toàn Thư, Cương Mục, Thực Lục..." },
    { text: "Đang tổng hợp bản đồ dẫn chứng sử liệu...", detail: "Đối chiếu trích đoạn, trang sách và đề mục" },
  ];

  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStage(1), 2200);
    const timer2 = setTimeout(() => setCurrentStage(2), 5200);
    const timer3 = setTimeout(() => setCurrentStage(3), 9000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="bg-[#FAF7F0] border border-[#E3DAC8] rounded-xl p-8 sm:p-12 shadow-xs text-center flex flex-col items-center justify-center my-6">
      {/* Animated Emblem */}
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-[#8B261E] text-[#FBF8F2] flex items-center justify-center shadow-md border-2 border-[#6B1B15] animate-pulse">
          <BookOpen className="w-8 h-8" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#D97706] text-white flex items-center justify-center shadow-xs">
          <Search className="w-3.5 h-3.5 animate-spin" />
        </div>
      </div>

      {/* Stage Status */}
      <div className="max-w-md mx-auto space-y-2">
        <h3 className="font-serif font-bold text-lg text-[#1F1B18] transition-all duration-300">
          {stages[currentStage].text}
        </h3>
        <p className="text-xs text-[#73685C]">
          {stages[currentStage].detail}
        </p>
      </div>

      {/* Stage steps indicators */}
      <div className="flex items-center gap-2 mt-6">
        {stages.map((_, idx) => (
          <div
            key={idx}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              idx === currentStage
                ? "w-8 bg-[#8B261E]"
                : idx < currentStage
                ? "w-4 bg-[#D97706]"
                : "w-2 bg-[#E2D8C5]"
            }`}
          />
        ))}
      </div>

      <p className="text-[11px] text-[#918779] mt-6 italic">
        Quá trình phân tích ngữ nghĩa và tra cứu thư tịch cổ thường mất từ 5 đến 15 giây...
      </p>
    </div>
  );
};
