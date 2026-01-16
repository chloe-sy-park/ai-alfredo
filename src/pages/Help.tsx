import { PageHeader } from '../components/layout';
import { HelpCircle, MessageCircle, Book, Mail, ChevronRight } from 'lucide-react';

interface HelpItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: () => void;
}

interface FAQItem {
  question: string;
  answer: string;
}

export default function Help() {
  const helpItems: HelpItem[] = [
    {
      id: 'guide',
      title: '사용 가이드',
      description: '알프레도 시작하기',
      icon: <Book size={20} className="text-[#A996FF]" />
    },
    {
      id: 'faq',
      title: '자주 묻는 질문',
      description: '궁금한 점을 확인하세요',
      icon: <HelpCircle size={20} className="text-[#4ECDC4]" />
    },
    {
      id: 'contact',
      title: '문의하기',
      description: '직접 연락주세요',
      icon: <Mail size={20} className="text-[#FFD43B]" />
    },
    {
      id: 'feedback',
      title: '피드백 보내기',
      description: '개선 의견을 남겨주세요',
      icon: <MessageCircle size={20} className="text-[#FF6B6B]" />
    }
  ];

  const faqs: FAQItem[] = [
    {
      question: '알프레도는 어떤 앱인가요?',
      answer: '알프레도는 ADHD 성향을 가진 분들을 위한 일정 관리 및 생산성 도우미입니다. 부드럽게 일상을 관리하고, 컨디션에 맞춰 조언을 드려요.'
    },
    {
      question: '데이터는 안전한가요?',
      answer: '네, 모든 데이터는 기기 내에 저장되며, 외부 서버로 전송되지 않습니다. 연동된 서비스 데이터도 안전하게 처리됩니다.'
    },
    {
      question: '캘린더 연동은 어떻게 하나요?',
      answer: '설정 > 연동 관리에서 Google Calendar를 연결할 수 있어요. 연결하면 일정을 자동으로 불러와 분석합니다.'
    },
    {
      question: '알림을 끄고 싶어요',
      answer: '설정 > 알림 설정에서 원하는 알림만 선택적으로 켜고 끌 수 있어요.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <PageHeader />

      <div className="max-w-[640px] mx-auto px-4 py-4 space-y-4">
        {/* 페이지 타이틀 */}
        <div className="flex items-center gap-2">
          <HelpCircle size={20} className="text-[#A996FF]" />
          <h1 className="text-lg font-bold text-[#1A1A1A]">도움말</h1>
        </div>

        {/* 도움말 카테고리 */}
        <div className="grid grid-cols-2 gap-3">
          {helpItems.map((item) => (
            <button
              key={item.id}
              onClick={item.action}
              className="bg-white rounded-xl p-4 text-left shadow-card hover:shadow-card-hover transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-[#F5F5F5] rounded-lg flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-[#1A1A1A]">{item.title}</h3>
                    <p className="text-xs text-[#999999]">{item.description}</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-[#CCCCCC]" />
              </div>
            </button>
          ))}
        </div>

        {/* FAQ 섹션 */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="p-4 border-b border-[#E5E5E5]">
            <h2 className="font-semibold text-[#1A1A1A]">자주 묻는 질문</h2>
          </div>

          <div className="divide-y divide-[#E5E5E5]">
            {faqs.map((faq, index) => (
              <details key={index} className="group">
                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#FAFAFA]">
                  <span className="text-sm font-medium text-[#1A1A1A]">{faq.question}</span>
                  <ChevronRight size={16} className="text-[#CCCCCC] transition-transform group-open:rotate-90" />
                </summary>
                <div className="px-4 pb-4">
                  <p className="text-sm text-[#666666]">{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* 버전 정보 */}
        <div className="text-center py-4">
          <p className="text-xs text-[#999999]">AlFredo v1.0.0</p>
          <p className="text-xs text-[#CCCCCC] mt-1">Made with 💜 for ADHD minds</p>
        </div>
      </div>
    </div>
  );
}
