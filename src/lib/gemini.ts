import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

export async function parseScheduleRequest(userInput: string) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDate = today.getDate();
    const currentDayOfWeek = today.getDay(); // 0=일요일, 6=토요일

    const prompt = `
사용자의 일정 요청을 분석하여 JSON 형식으로 변환해주세요.

현재 정보:
- 오늘 날짜: ${currentYear}년 ${currentMonth}월 ${currentDate}일
- 오늘 요일: ${['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'][currentDayOfWeek]}

입력: "${userInput}"

다음 형식으로 응답해주세요:
{
  "eventTemplate": {
    "title": "일정 제목",
    "description": "설명 (없으면 빈 문자열)",
    "location": "장소 (없으면 빈 문자열)",
    "originalStartDate": "YYYY-MM-DD",
    "originalEndDate": "YYYY-MM-DD",
    "recurrence": {
      "type": "weekly",
      "interval": 1,
      "daysOfWeek": [6],
      "count": 8
    }
  }
}

제목 생성 규칙:
- 핵심 키워드만 추출하여 간결하게 작성
- 날짜, 기간, 반복 패턴은 제목에 포함하지 않음
- 일정의 본질적 내용만 포함

예시:
- "1월 21일부터 6월 말까지 매주 화, 목요일 회의 일정 추가" → title: "회의"
- "매주 토요일 헬스장에서 운동하기" → title: "헬스장 운동" 
- "매일 아침 7시 조깅 루틴" → title: "아침 조깅"
- "2주마다 병원에서 정기 검진" → title: "정기 검진"
- "매월 첫째 금요일 팀 회식" → title: "팀 회식"
- "매주 월수금 영어 수업 듣기" → title: "영어 수업"
- "주말마다 가족과 함께 시간 보내기" → title: "가족 시간"

엣지케이스 처리 규칙:

1. **날짜 추론**:
   - 연도 없음: 현재 연도(${currentYear}) 사용
   - 월 없음: 현재 월(${currentMonth}) 사용, 단 과거 날짜가 되면 다음 달 사용
   - 날짜 없음: 오늘(${currentDate}일) 사용
   - "내일": ${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(currentDate + 1).padStart(2, '0')}
   - "다음주": 다음주 월요일부터
   - "다음달": 다음달 1일부터

2. **요일 기반 일정**:
   - "매주 토요일": 다음 토요일부터 시작
   - "매주 월요일": 다음 월요일부터 시작
   - 오늘이 해당 요일이면 오늘부터 시작
   - 과거 요일이면 다음주 해당 요일부터 시작

3. **반복 패턴**:
   - "매일": type="daily", count=30
   - "매주": type="weekly", count=8
   - "매월": type="monthly", count=6
   - "매년": type="yearly", count=3
   - "2주마다": type="weekly", interval=2, count=8
   - "3일마다": type="daily", interval=3, count=20

4. **특수 표현**:
   - "주말": daysOfWeek=[0,6] (일요일, 토요일)
   - "평일": daysOfWeek=[1,2,3,4,5] (월~금)
   - "월수금": daysOfWeek=[1,3,5]
   - "화목": daysOfWeek=[2,4]

5. **시간 처리**:
   - 시간 명시 없음: 종일 일정 (startDate = endDate)
   - "오전", "오후", "저녁" 등: description에 포함

6. **기간 일정**:
   - "3일간", "일주일간": endDate를 startDate + 기간으로 설정
   - "~부터 ~까지": 명시된 기간 사용

7. **애매한 표현**:
   - "가끔": 매주 1회로 해석
   - "자주": 매주 2-3회로 해석
   - "정기적으로": 매주 1회로 해석

8. **기본값**:
   - title이 명확하지 않으면 입력 텍스트에서 핵심 키워드만 추출
   - 반복 횟수 미지정시: 매일=30회, 매주=8회, 매월=6회
   - 시작일 미지정시: 오늘 또는 다음 해당 요일

9. **count 계산 규칙**:
   - 종료일이 명시된 경우 반드시 실제 횟수 계산
   - "8월 말까지 매주 화목": 1월 12일부터 8월 31일까지 화요일+목요일 총 횟수
   - count는 반드시 양의 정수, null/undefined 금지
   - 예상 횟수: 약 7개월 × 4주 × 2일 = 약 56회

예시:
- "매주 토요일 운동" → 다음 토요일부터 8주간
- "내일 회의" → 내일 하루 일정
- "매일 아침 산책" → 오늘부터 30일간
- "다음주부터 매주 화요일 회의" → 다음주 화요일부터 8주간
- "매월 첫째주 금요일 정기모임" → 다음 첫째주 금요일부터 6개월간
- "주말마다 가족시간" → 다음 주말부터 토일 8주간
- "2주마다 병원" → 다음 해당일부터 2주 간격으로 8회

중요: JSON만 응답하고 다른 설명은 포함하지 마세요.
`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("AI Response:", text);

        return extractAndParseJSON(text);
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("일정 분석에 실패했습니다.");
    }
}

// 더 안전한 JSON 파싱 함수
function extractAndParseJSON(text: string) {
    try {
        // 1. 마크다운 코드 블록 제거
        let cleaned = text.replace(/```json\s*|\s*```/g, "").trim();
        
        // 2. 추가 마크다운 패턴 제거
        cleaned = cleaned.replace(/```\s*|\s*```/g, "").trim();
        
        // 3. JSON 객체 부분만 추출 (첫 번째 { 부터 마지막 } 까지)
        const firstBrace = cleaned.indexOf("{");
        const lastBrace = cleaned.lastIndexOf("}");

        if (firstBrace !== -1 && lastBrace !== -1 && firstBrace < lastBrace) {
            cleaned = cleaned.substring(firstBrace, lastBrace + 1);
        }

        console.log("Parsed JSON:", cleaned);

        // 4. JSON 유효성 검사 및 파싱
        const parsed = JSON.parse(cleaned);
        
        // 5. 필수 필드 검증
        if (!parsed.eventTemplate) {
            throw new Error("eventTemplate 필드가 없습니다.");
        }
        
        if (!parsed.eventTemplate.title) {
            throw new Error("title 필드가 없습니다.");
        }
        
        if (!parsed.eventTemplate.originalStartDate) {
            throw new Error("originalStartDate 필드가 없습니다.");
        }

        return parsed;
    } catch (error) {
        console.error("JSON parsing failed:", error);
        console.error("Original text:", text);
        throw new Error("응답을 파싱할 수 없습니다: " + error.message);
    }
}
